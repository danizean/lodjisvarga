"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { villaFullSchema } from "@/lib/validations/villa-full";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/types/database";

type VillaRow = Tables<"villas">;
type GalleryInsert = TablesInsert<"gallery">;

import { 
  getAuthenticatedAdmin, 
  logAudit, 
  revalidateVillaPaths, 
  normalizeGalleryItems 
} from "@/lib/utils/admin";

// ─── 1. SAVE / UPDATE FULL VILLA (Upsert) ────────────────────────────────────
/**
 * Creates OR updates a Villa with all its related data atomically.
 * Handles: villa info, amenities, gallery, room types, room amenities, room galleries.
 * Uses Soft Delete for room types that are removed from the form.
 */
export async function saveFullVillaData(data: unknown) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  const parsed = villaFullSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Zod Validation Error:", JSON.stringify(parsed.error.format(), null, 2));
    return { error: "Validasi form gagal.", details: parsed.error.flatten().fieldErrors };
  }

  const { villa, room_types, gallery, amenity_ids } = parsed.data;
  const isUpdate = Boolean(villa.id);
  const normalizedVillaGallery = normalizeGalleryItems(gallery);

  // Capture old data for audit log
  let oldVillaData: VillaRow | null = null;
  if (isUpdate && villa.id) {
    const { data: old } = await supabase.from("villas").select("*").eq("id", villa.id).single();
    oldVillaData = old;
  }

  const villaPayload: TablesInsert<"villas"> = {
    id: villa.id || undefined,
    name: villa.name,
    slug: villa.slug,
    description: villa.description,
    address: villa.address,
    gmaps_url: villa.gmaps_url,
    whatsapp_number: villa.whatsapp_number,
    default_whatsapp_message: villa.default_whatsapp_message ?? null,
    status: villa.status,
  };

  // ── 1. Upsert Villa ──
  const { data: savedVilla, error: villaError } = await supabase
    .from("villas")
    .upsert(villaPayload)
    .select()
    .single();

  if (villaError || !savedVilla) {
    return { error: `Database Error (Villa): ${villaError?.message}` };
  }

  await logAudit(supabase, isUpdate ? "UPDATE" : "CREATE", "villas", savedVilla.id, oldVillaData, savedVilla, user.id);

  try {
    // ── 2. Sync Villa Amenities (delete-then-insert) ──
    const { error: deleteVillaAmenitiesError } = await supabase
      .from("villa_amenities")
      .delete()
      .eq("villa_id", savedVilla.id);
    if (deleteVillaAmenitiesError) throw new Error(`Villa Amenities Delete Error: ${deleteVillaAmenitiesError.message}`);
    if (amenity_ids.length > 0) {
      const payload: TablesInsert<"villa_amenities">[] = amenity_ids.map((amenityId) => ({
        villa_id: savedVilla.id,
        amenity_id: amenityId,
      }));
      const { error } = await supabase.from("villa_amenities").insert(payload);
      if (error) throw new Error(`Villa Amenities Error: ${error.message}`);
    }

    // ── 3. Sync Villa Gallery (delete-then-insert, only villa-level items) ──
    const { error: deleteVillaGalleryError } = await supabase
      .from("gallery")
      .delete()
      .eq("villa_id", savedVilla.id)
      .is("room_type_id", null);
    if (deleteVillaGalleryError) throw new Error(`Villa Gallery Delete Error: ${deleteVillaGalleryError.message}`);
    if (normalizedVillaGallery.length > 0) {
      const payload: GalleryInsert[] = normalizedVillaGallery.map((img) => ({
        villa_id: savedVilla.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
        display_order: img.display_order,
      }));
      const { error } = await supabase.from("gallery").insert(payload);
      if (error) throw new Error(`Villa Gallery Error: ${error.message}`);
    }

    // ── 4. Soft-delete room types removed from the form ──
    if (isUpdate) {
      const payloadRoomIds = room_types
        .map((rt) => rt.id)
        .filter((roomTypeId): roomTypeId is string => Boolean(roomTypeId));
      const { data: existingRooms } = await supabase
        .from("room_types")
        .select("id")
        .eq("villa_id", savedVilla.id)
        .neq("status", "inactive");

      const existingIds = (existingRooms ?? []).map((room) => room.id);
      const removedIds = existingIds.filter((existingId) => !payloadRoomIds.includes(existingId));

      if (removedIds.length > 0) {
        await supabase.from("room_types").update({ status: "inactive" }).in("id", removedIds);
        for (const rId of removedIds) {
          await logAudit(supabase, "SOFT_DELETE", "room_types", rId, null, { status: "inactive" }, user.id);
        }
      }
    }

    // ── 5. Upsert each Room Type + its amenities + its gallery ──
    if (room_types.length > 0) {
      for (const rt of room_types) {
        const normalizedRoomGallery = normalizeGalleryItems(rt.gallery);
        const roomPayload: any = {
          id: rt.id || undefined,
          villa_id: savedVilla.id,
          name: rt.name,
          base_price: rt.base_price,
          bed_type: (rt as any).bed_type ?? null,
          highlight_amenity_ids: (rt as any).highlight_amenity_ids ?? [],
          description: rt.description,
          status: "active",
        };

        const { data: savedRt, error: rtError } = await supabase
          .from("room_types")
          .upsert(roomPayload)
          .select()
          .single();

        if (rtError) throw new Error(`Room Type Error (${rt.name}): ${rtError.message}`);

        await logAudit(supabase, rt.id ? "UPDATE" : "CREATE", "room_types", savedRt.id, null, savedRt, user.id);

        // Sync Room Amenities
        const { error: deleteRoomAmenitiesError } = await supabase
          .from("room_type_amenities")
          .delete()
          .eq("room_type_id", savedRt.id);
        if (deleteRoomAmenitiesError) {
          throw new Error(`Room Amenities Delete Error (${rt.name}): ${deleteRoomAmenitiesError.message}`);
        }
        if (rt.amenity_ids.length > 0) {
          const roomAmenitiesPayload: TablesInsert<"room_type_amenities">[] = rt.amenity_ids.map((amenityId) => ({
            room_type_id: savedRt.id,
            amenity_id: amenityId,
          }));
          const { error: roomAmenitiesError } = await supabase
            .from("room_type_amenities")
            .insert(roomAmenitiesPayload);
          if (roomAmenitiesError) {
            throw new Error(`Room Amenities Error (${rt.name}): ${roomAmenitiesError.message}`);
          }
        }

        // Sync Room Gallery
        const { error: deleteRoomGalleryError } = await supabase
          .from("gallery")
          .delete()
          .eq("room_type_id", savedRt.id);
        if (deleteRoomGalleryError) {
          throw new Error(`Room Gallery Delete Error (${rt.name}): ${deleteRoomGalleryError.message}`);
        }
        if (normalizedRoomGallery.length > 0) {
          const roomGalleryPayload: GalleryInsert[] = normalizedRoomGallery.map((img) => ({
            room_type_id: savedRt.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            display_order: img.display_order,
          }));
          const { error: roomGalleryError } = await supabase
            .from("gallery")
            .insert(roomGalleryPayload);
          if (roomGalleryError) {
            throw new Error(`Room Gallery Error (${rt.name}): ${roomGalleryError.message}`);
          }
        }
      }
    }

    revalidateVillaPaths({
      currentSlug: savedVilla.slug,
      previousSlug: oldVillaData?.slug,
      includeAdminEditId: savedVilla.id,
    });
    return { success: true, villa_id: savedVilla.id };

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.";
    console.error("saveFullVillaData Error:", message);
    if (!isUpdate) {
      // Only rollback on create — on update, preserve data.
      await supabase.from("villas").delete().eq("id", savedVilla.id);
    }
    return { error: message };
  }
}

// ─── 2. SOFT DELETE VILLA ─────────────────────────────────────────────────────
export async function archiveVilla(id: string) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  const { data: old } = await supabase.from("villas").select("*").eq("id", id).single();
  const { error } = await supabase.from("villas").update({ status: "inactive" }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, "SOFT_DELETE", "villas", id, old, { status: "inactive" }, user.id);
  revalidateVillaPaths({
    currentSlug: old?.slug,
    previousSlug: old?.slug,
    includeAdminEditId: id,
  });
  return { success: true };
}

// ─── 3. CHECK SLUG AVAILABILITY ───────────────────────────────────────────────
export async function checkSlugAvailability(slug: string, currentVillaId?: string) {
  const supabase = await createClient();
  const query = supabase.from("villas").select("id").eq("slug", slug);
  if (currentVillaId) query.neq("id", currentVillaId);
  const { data } = await query.single();
  return { available: !data };
}



// ─── 5. UPDATE VILLA STATUS (quick toggle) ───────────────────────────────────
export async function updateVillaStatus(id: string, status: "active" | "coming_soon" | "inactive") {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  const { error } = await supabase.from("villas").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  const { data: updatedVilla } = await supabase.from("villas").select("slug").eq("id", id).single();
  revalidateVillaPaths({
    currentSlug: updatedVilla?.slug,
    previousSlug: updatedVilla?.slug,
    includeAdminEditId: id,
  });
  return { success: true };
}


export async function saveVillaDetails(data: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      address: data.address,
      gmaps_url: data.gmaps_url,
      whatsapp_number: data.whatsapp_number,
      default_whatsapp_message: data.default_whatsapp_message,
      status: data.status,
    };

    let villaId = data.id;

    if (villaId) {
      const { error } = await supabase
        .from("villas")
        .update(payload)
        .eq("id", villaId);
      
      if (error) throw error;
      await logAudit(supabase, "UPDATE", "villas", villaId, null, payload, user.id);
    } else {
      const { data: newVilla, error } = await supabase
        .from("villas")
        .insert(payload)
        .select("id")
        .single();
      
      if (error) throw error;
      villaId = newVilla.id;
      await logAudit(supabase, "CREATE", "villas", villaId, null, payload, user.id);
    }

    revalidateVillaPaths({ currentSlug: data.slug });

    return { success: true, villa_id: villaId };
  } catch (error: any) {
    console.error("Save villa details error:", error);
    return { success: false, error: error.message };
  }
}

// ─── 6. SAVE VILLA AMENITIES (standalone sync) ────────────────────────────────
/**
 * Syncs villa-level amenities for a given villa via delete-then-insert.
 *
 * Why delete-then-insert (not upsert):
 *   The junction table villa_amenities has no natural unique key to upsert on
 *   beyond (villa_id, amenity_id). A full replace is safer and simpler.
 *
 * Called from: admin/villas/[id]/amenities/page.tsx
 *
 * @param villaId   - UUID of the villa to update
 * @param amenityIds - Full list of amenity UUIDs that should be active
 */
export async function saveVillaAmenities(
  villaId: string,
  amenityIds: string[]
): Promise<{ success: true } | { error: string }> {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  if (!villaId) return { error: "Villa ID is required." };

  // ── 1. Delete all current amenities for this villa ──
  const { error: deleteError } = await supabase
    .from("villa_amenities")
    .delete()
    .eq("villa_id", villaId);

  if (deleteError) {
    console.error("saveVillaAmenities — delete error:", deleteError.message);
    return { error: `Gagal menghapus fasilitas lama: ${deleteError.message}` };
  }

  // ── 2. Insert the new selection (skip if empty — deletion above already cleared) ──
  if (amenityIds.length > 0) {
    const payload: TablesInsert<"villa_amenities">[] = amenityIds.map((amenityId) => ({
      villa_id: villaId,
      amenity_id: amenityId,
    }));

    const { error: insertError } = await supabase
      .from("villa_amenities")
      .insert(payload);

    if (insertError) {
      console.error("saveVillaAmenities — insert error:", insertError.message);
      return { error: `Gagal menyimpan fasilitas baru: ${insertError.message}` };
    }
  }

  // ── 3. Revalidate public pages so the facilities grid reflects the change ──
  const { data: villa } = await supabase
    .from("villas")
    .select("slug")
    .eq("id", villaId)
    .single();

  revalidateVillaPaths({
    currentSlug: villa?.slug,
    includeAdminEditId: villaId,
  });

  return { success: true };
}

// ─── 7. SAVE VILLA GALLERY (standalone sync) ─────────────────────────────────
/**
 * Syncs the villa-level photo gallery via scoped delete-then-insert.
 *
 * Key constraint — the gallery table stores BOTH villa photos and room photos
 * in the same table, distinguished by room_type_id:
 *
 *   villa photo  → villa_id = X, room_type_id = NULL
 *   room photo   → villa_id = X, room_type_id = Y
 *
 * The delete MUST filter `.is("room_type_id", null)` to guarantee that
 * room-level gallery rows are NEVER touched by this action.
 *
 * Called from: admin/villas/[id]/media/page.tsx (auto-saves on every change)
 *
 * @param villaId - UUID of the villa to update
 * @param items   - Full ordered list of gallery items to persist
 */

// Inline type — mirrors GalleryUploader's GalleryItem without importing from
// a "use client" module (cross-boundary imports break the server action boundary).
type VillaGalleryItem = {
  id?: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
};

export async function saveVillaGallery(
  villaId: string,
  items: VillaGalleryItem[]
): Promise<{ success: true } | { error: string }> {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  if (!villaId) return { error: "Villa ID is required." };

  // ── Validate: ensure at most one primary is set ──────────────────────────────
  // The GalleryUploader enforces this on the client, but we guard server-side too.
  const primaryItems = items.filter((item) => item.is_primary);
  if (primaryItems.length > 1) {
    return { error: "Hanya boleh ada satu foto utama." };
  }

  // ── 1. Delete only villa-level rows (room_type_id IS NULL) ──────────────────
  const { error: deleteError } = await supabase
    .from("gallery")
    .delete()
    .eq("villa_id", villaId)
    .is("room_type_id", null); // ← critical scope guard

  if (deleteError) {
    console.error("saveVillaGallery — delete error:", deleteError.message);
    return { error: `Gagal menghapus galeri lama: ${deleteError.message}` };
  }

  // ── 2. Insert the new gallery items (skip if empty — clearing is valid) ──────
  if (items.length > 0) {
    // Normalise: ensure display_order is sequential from 0 regardless of
    // what the client sent (guards against gaps or duplicates).
    const payload: GalleryInsert[] = items.map((item, index) => ({
      villa_id: villaId,
      room_type_id: null, // always null for villa-level gallery
      image_url: item.image_url,
      is_primary: item.is_primary,
      display_order: index, // re-index from 0 for clean ordering
    }));

    const { error: insertError } = await supabase
      .from("gallery")
      .insert(payload);

    if (insertError) {
      console.error("saveVillaGallery — insert error:", insertError.message);
      return { error: `Gagal menyimpan galeri baru: ${insertError.message}` };
    }
  }

  // ── 3. Revalidate public pages so the hero + gallery section stays fresh ─────
  const { data: villa } = await supabase
    .from("villas")
    .select("slug")
    .eq("id", villaId)
    .single();

  revalidateVillaPaths({
    currentSlug: villa?.slug,
    includeAdminEditId: villaId,
  });

  return { success: true };
}

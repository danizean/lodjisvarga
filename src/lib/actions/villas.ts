"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { villaFullSchema } from "@/lib/validations/villa-full";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type VillaRow = Tables<"villas">;
type RoomTypeInsert = TablesInsert<"room_types">;
type RoomTypeUpdate = TablesUpdate<"room_types">;
type GalleryInsert = TablesInsert<"gallery">;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, isAdmin: false };

  const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");
  if (!isAdminError && isAdminResult === true) {
    return { supabase, user, isAdmin: true };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role?.toLowerCase();
  return { supabase, user, isAdmin: role === "admin" || role === "superadmin" };
}

async function logAudit(
  supabase: SupabaseServerClient,
  action: string,
  tableName: string,
  recordId: string,
  oldValues: Json | null,
  newValues: Json | null,
  userId: string
) {
  const payload: TablesInsert<"audit_logs"> = {
    action,
    table_name: tableName,
    record_id: recordId,
    old_values: oldValues,
    new_values: newValues,
    user_id: userId,
  };

  await supabase.from("audit_logs").insert(payload);
}

function revalidateVillaPaths(params: {
  currentSlug?: string | null;
  previousSlug?: string | null;
  includeAdminEditId?: string | null;
}) {
  revalidatePath("/");
  revalidatePath("/admin/villas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/calendar");

  if (params.includeAdminEditId) {
    revalidatePath(`/admin/villas/${params.includeAdminEditId}/edit`);
  }

  if (params.currentSlug) {
    revalidatePath(`/villas/${params.currentSlug}`);
  }

  if (params.previousSlug && params.previousSlug !== params.currentSlug) {
    revalidatePath(`/villas/${params.previousSlug}`);
  }
}

function normalizeGalleryItems(
  items: Array<{
    image_url: string;
    is_primary?: boolean | null;
    display_order?: number | null;
  }>
) {
  const seen = new Set<string>();
  const deduped = items
    .filter((item) => {
      const imageUrl = item.image_url?.trim();
      if (!imageUrl || seen.has(imageUrl)) return false;
      seen.add(imageUrl);
      return true;
    })
    .sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0))
    .map((item, index) => ({
      image_url: item.image_url.trim(),
      is_primary: Boolean(item.is_primary),
      display_order: index,
    }));

  if (deduped.length > 0 && !deduped.some((item) => item.is_primary)) {
    deduped[0].is_primary = true;
  }

  return deduped;
}

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

// ─── 4. INDIVIDUAL ROOM TYPE ACTIONS ─────────────────────────────────────────
export async function addRoomTypeToVilla(data: {
  villa_id: string;
  name: string;
  base_price: number;
  capacity_adult: number;
  capacity_child: number;
  description?: string;
}) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  const payload: RoomTypeInsert = {
    ...data,
    description: data.description ?? null,
  };

  const { data: newRoom, error } = await supabase
    .from("room_types")
    .insert(payload)
    .select()
    .single();

  if (error) return { error: error.message };
  await logAudit(supabase, "CREATE", "room_types", newRoom.id, null, newRoom, user.id);
  revalidatePath("/admin/villas");
  return { success: true, data: newRoom };
}

export async function updateRoomType(id: string, data: Partial<{ name: string; base_price: number; capacity_adult: number; capacity_child: number; description: string }>) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  const payload: RoomTypeUpdate = {
    ...data,
    description: data.description ?? undefined,
  };

  const { data: old } = await supabase.from("room_types").select("*").eq("id", id).single();
  const { error } = await supabase.from("room_types").update(payload).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, "UPDATE", "room_types", id, old, payload, user.id);
  revalidatePath("/admin/villas");
  return { success: true };
}

export async function deleteRoomType(id: string) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  // Soft delete — preserve reservation history
  const { data: old } = await supabase.from("room_types").select("*").eq("id", id).single();
  const { error } = await supabase.from("room_types").update({ status: "inactive" }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, "SOFT_DELETE", "room_types", id, old, { status: "inactive" }, user.id);
  revalidatePath("/admin/villas");
  return { success: true };
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

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { villaFullSchema } from "@/lib/validations/villa-full";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || profile?.role === "superadmin";
  return { supabase, user, isAdmin };
}

async function logAudit(
  supabase: any,
  action: string,
  tableName: string,
  recordId: string,
  oldValues: any,
  newValues: any,
  userId: string
) {
  await supabase.from("audit_logs").insert({
    action,
    table_name: tableName,
    record_id: recordId,
    old_values: oldValues,
    new_values: newValues,
    user_id: userId,
  });
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
  const isUpdate = !!villa.id;

  // Capture old data for audit log
  let oldVillaData: any = null;
  if (isUpdate) {
    const { data: old } = await supabase.from("villas").select("*").eq("id", villa.id).single();
    oldVillaData = old;
  }

  // ── 1. Upsert Villa ──
  const { data: savedVilla, error: villaError } = await supabase
    .from("villas")
    .upsert({
      id: villa.id || undefined,
      name: villa.name,
      slug: villa.slug,
      description: villa.description,
      address: villa.address,
      gmaps_url: villa.gmaps_url,
      whatsapp_number: villa.whatsapp_number,
      default_whatsapp_message: (villa as any).default_whatsapp_message ?? null,
      status: villa.status,
    })
    .select()
    .single();

  if (villaError || !savedVilla) {
    return { error: `Database Error (Villa): ${villaError?.message}` };
  }

  await logAudit(supabase, isUpdate ? "UPDATE" : "CREATE", "villas", savedVilla.id, oldVillaData, savedVilla, user.id);

  try {
    // ── 2. Sync Villa Amenities (delete-then-insert) ──
    await supabase.from("villa_amenities").delete().eq("villa_id", savedVilla.id);
    if (amenity_ids && amenity_ids.length > 0) {
      const payload = amenity_ids.map(id => ({ villa_id: savedVilla.id, amenity_id: id }));
      const { error } = await supabase.from("villa_amenities").insert(payload);
      if (error) throw new Error(`Villa Amenities Error: ${error.message}`);
    }

    // ── 3. Sync Villa Gallery (delete-then-insert, only villa-level items) ──
    await supabase.from("gallery").delete().eq("villa_id", savedVilla.id).is("room_type_id", null);
    if (gallery && gallery.length > 0) {
      const payload = gallery.map(img => ({
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
      const payloadRoomIds = room_types.map(rt => rt.id).filter(Boolean) as string[];
      const { data: existingRooms } = await supabase
        .from("room_types")
        .select("id")
        .eq("villa_id", savedVilla.id)
        .neq("status", "inactive");

      const existingIds = (existingRooms ?? []).map((r: any) => r.id);
      const removedIds = existingIds.filter((id: string) => !payloadRoomIds.includes(id));

      if (removedIds.length > 0) {
        await supabase.from("room_types").update({ status: "inactive" } as any).in("id", removedIds);
        for (const rId of removedIds) {
          await logAudit(supabase, "SOFT_DELETE", "room_types", rId, null, { status: "inactive" }, user.id);
        }
      }
    }

    // ── 5. Upsert each Room Type + its amenities + its gallery ──
    if (room_types && room_types.length > 0) {
      for (const rt of room_types) {
        const { data: savedRt, error: rtError } = await supabase
          .from("room_types")
          .upsert({
            id: rt.id || undefined,
            villa_id: savedVilla.id,
            name: rt.name,
            base_price: rt.base_price,
            capacity_adult: rt.capacity_adult,
            capacity_child: rt.capacity_child,
            description: rt.description,
            status: "active",
          } as any)
          .select()
          .single();

        if (rtError) throw new Error(`Room Type Error (${rt.name}): ${rtError.message}`);

        await logAudit(supabase, rt.id ? "UPDATE" : "CREATE", "room_types", savedRt.id, null, savedRt, user.id);

        // Sync Room Amenities
        await supabase.from("room_type_amenities").delete().eq("room_type_id", savedRt.id);
        if (rt.amenity_ids && rt.amenity_ids.length > 0) {
          await supabase.from("room_type_amenities").insert(
            rt.amenity_ids.map(id => ({ room_type_id: savedRt.id, amenity_id: id }))
          );
        }

        // Sync Room Gallery
        await supabase.from("gallery").delete().eq("room_type_id", savedRt.id);
        if (rt.gallery && rt.gallery.length > 0) {
          await supabase.from("gallery").insert(
            rt.gallery.map(img => ({
              villa_id: savedVilla.id,
              room_type_id: savedRt.id,
              image_url: img.image_url,
              is_primary: img.is_primary,
              display_order: img.display_order,
            }))
          );
        }
      }
    }

    revalidatePath("/admin/villas");
    revalidatePath("/admin/dashboard");
    return { success: true, villa_id: savedVilla.id };

  } catch (err: any) {
    console.error("saveFullVillaData Error:", err.message);
    if (!isUpdate) {
      // Only rollback on create — on update, preserve data.
      await supabase.from("villas").delete().eq("id", savedVilla.id);
    }
    return { error: err.message || "Terjadi kesalahan saat menyimpan data." };
  }
}

// ─── 2. SOFT DELETE VILLA ─────────────────────────────────────────────────────
export async function archiveVilla(id: string) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized" };
  if (!isAdmin) return { error: "Forbidden" };

  const { data: old } = await supabase.from("villas").select("*").eq("id", id).single();
  const { error } = await supabase.from("villas").update({ status: "inactive" }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, "SOFT_DELETE", "villas", id, old, { status: "inactive" }, user.id);
  revalidatePath("/admin/villas");
  revalidatePath("/admin/dashboard");
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
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const { data: newRoom, error } = await supabase
    .from("room_types")
    .insert([data] as any)
    .select()
    .single();

  if (error) return { error: error.message };
  await logAudit(supabase, "CREATE", "room_types", newRoom.id, null, newRoom, user.id);
  revalidatePath("/admin/villas");
  return { success: true, data: newRoom };
}

export async function updateRoomType(id: string, data: Partial<{ name: string; base_price: number; capacity_adult: number; capacity_child: number; description: string }>) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const { data: old } = await supabase.from("room_types").select("*").eq("id", id).single();
  const { error } = await supabase.from("room_types").update(data as any).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, "UPDATE", "room_types", id, old, data, user.id);
  revalidatePath("/admin/villas");
  return { success: true };
}

export async function deleteRoomType(id: string) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  // Soft delete — preserve reservation history
  const { data: old } = await supabase.from("room_types").select("*").eq("id", id).single();
  const { error } = await supabase.from("room_types").update({ status: "inactive" } as any).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, "SOFT_DELETE", "room_types", id, old, { status: "inactive" }, user.id);
  revalidatePath("/admin/villas");
  return { success: true };
}

// ─── 5. UPDATE VILLA STATUS (quick toggle) ───────────────────────────────────
export async function updateVillaStatus(id: string, status: "active" | "coming_soon" | "inactive") {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const { error } = await supabase.from("villas").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/villas");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
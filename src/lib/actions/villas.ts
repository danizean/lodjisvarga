"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { villaFullSchema } from "@/lib/validations/villa-full";

/**
 * 1. SAVE FULL VILLA DATA
 * Digunakan saat pertama kali membuat Villa lengkap dengan kamar dan gallery.
 */
export async function saveFullVillaData(data: any) {
  const supabase = await createClient();

  // 1. Validasi Zod (Pastikan skema sinkron dengan payload { villa, room_types, gallery, amenity_ids })
  const parsed = villaFullSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Zod Error Detail:", JSON.stringify(parsed.error.format(), null, 2));
    return { 
      error: "Form Validation Failed", 
      details: parsed.error.flatten().fieldErrors 
    };
  }

  const { villa, room_types, gallery, amenity_ids } = parsed.data;

  // 2. Insert ke table 'villas'
  const { data: newVilla, error: villaError } = await supabase
    .from("villas")
    .insert({
      id: villa.id || undefined,
      name: villa.name,
      slug: villa.slug,
      description: villa.description,
      address: villa.address,
      gmaps_url: villa.gmaps_url,
      whatsapp_number: villa.whatsapp_number,
      status: villa.status,
    })
    .select("id")
    .single();

  if (villaError || !newVilla) {
    return { error: `Database Error (Villa): ${villaError?.message}` };
  }

  try {
    // 3. Insert Villa Amenities (Bulk Insert)
    if (amenity_ids && amenity_ids.length > 0) {
      const amPayload = amenity_ids.map(id => ({ 
        villa_id: newVilla.id, 
        amenity_id: id 
      }));
      const { error: amError } = await supabase.from("villa_amenities").insert(amPayload);
      if (amError) throw new Error(`Villa Amenities Error: ${amError.message}`);
    }

    // 4. Insert Villa Gallery (Bulk Insert)
    if (gallery && gallery.length > 0) {
      const galPayload = gallery.map(img => ({
        villa_id: newVilla.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
        display_order: img.display_order
      }));
      const { error: galError } = await supabase.from("gallery").insert(galPayload);
      if (galError) throw new Error(`Villa Gallery Error: ${galError.message}`);
    }

    // 5. Insert Room Types & Child Relations
    if (room_types && room_types.length > 0) {
      for (const rt of room_types) {
        const { data: newRt, error: rtError } = await supabase
          .from("room_types")
          .insert({
            id: rt.id, // Menggunakan UUID yang digenerate di Client
            villa_id: newVilla.id,
            name: rt.name,
            base_price: rt.base_price,
            capacity_adult: rt.capacity_adult,
            capacity_child: rt.capacity_child,
            description: rt.description
          })
          .select("id")
          .single();

        if (rtError) throw new Error(`Room Error (${rt.name}): ${rtError.message}`);

        // Insert Room Amenities (Bulk)
        if (rt.amenity_ids && rt.amenity_ids.length > 0) {
          const rtAmPayload = rt.amenity_ids.map(id => ({ 
            room_type_id: newRt.id, 
            amenity_id: id 
          }));
          await supabase.from("room_type_amenities").insert(rtAmPayload);
        }

        // Insert Room Gallery (Bulk)
        if (rt.gallery && rt.gallery.length > 0) {
          const rtGalPayload = rt.gallery.map(img => ({
            room_type_id: newRt.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            display_order: img.display_order
          }));
          await supabase.from("gallery").insert(rtGalPayload);
        }
      }
    }

    revalidatePath("/admin/villas");
    return { success: true, villa_id: newVilla.id };

  } catch (err: any) {
    console.error("Critical Rollback Triggered:", err.message);
    // Rollback: Hapus villa jika salah satu proses relasi gagal
    await supabase.from("villas").delete().eq("id", newVilla.id);
    return { error: err.message || "Failed to save complete data" };
  }
}

/**
 * 2. ADD INDIVIDUAL ROOM TYPE
 * Digunakan di Room Editor untuk menambah kamar baru ke villa yang sudah ada.
 */
export async function addRoomTypeToVilla(data: {
  villa_id: string;
  name: string;
  base_price: number;
  capacity_adult: number;
  capacity_child: number;
  description?: string;
}) {
  const supabase = await createClient();
  const { data: newRoom, error } = await supabase
    .from("room_types")
    .insert([data])
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/villas");
  return { success: true, data: newRoom };
}

/**
 * 3. UPDATE INDIVIDUAL ROOM TYPE
 */
export async function updateRoomType(id: string, data: any) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("room_types")
    .update(data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/villas");
  return { success: true };
}

/**
 * 4. DELETE INDIVIDUAL ROOM TYPE
 */
export async function deleteRoomType(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("room_types")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/villas");
  return { success: true };
}
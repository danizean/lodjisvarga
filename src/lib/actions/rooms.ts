"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type { TablesInsert, TablesUpdate } from "@/types/database";
import { 
  getAuthenticatedAdmin, 
  logAudit, 
  normalizeGalleryItems 
} from "@/lib/utils/admin";

type RoomTypeInsert = TablesInsert<"room_types">;
type RoomTypeUpdate = TablesUpdate<"room_types">;
type GalleryInsert = TablesInsert<"gallery">;

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
  revalidateTag("villas");
  
  return { success: true, data: newRoom };
}

export async function updateRoomType(
  id: string, 
  data: Partial<{ 
    name: string; 
    base_price: number; 
    capacity_adult: number; 
    capacity_child: number; 
    bed_type: string;
    description: string;
  }>
) {
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
  revalidateTag("villas");

  return { success: true };
}

export async function deleteRoomType(id: string) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  const { data: old } = await supabase.from("room_types").select("*").eq("id", id).single();
  const { error } = await supabase.from("room_types").update({ status: "inactive" }).eq("id", id);
  
  if (error) return { error: error.message };

  await logAudit(supabase, "SOFT_DELETE", "room_types", id, old, { status: "inactive" }, user.id);
  
  revalidatePath("/admin/villas");
  revalidateTag("villas");

  return { success: true };
}

export async function saveRoomAmenities(roomId: string, amenityIds: string[]) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  // 1. Clear existing room amenities
  const { error: deleteError } = await supabase
    .from("room_type_amenities")
    .delete()
    .eq("room_type_id", roomId);
    
  if (deleteError) return { error: deleteError.message };

  // 2. Insert new amenities
  if (amenityIds.length > 0) {
    const payload: TablesInsert<"room_type_amenities">[] = amenityIds.map((amenityId) => ({
      room_type_id: roomId,
      amenity_id: amenityId,
    }));
    
    const { error: insertError } = await supabase
      .from("room_type_amenities")
      .insert(payload);
      
    if (insertError) return { error: insertError.message };
  }

  await logAudit(supabase, "UPDATE_AMENITIES", "room_types", roomId, null, { amenityIds }, user.id);
  
  revalidatePath("/admin/villas");
  revalidateTag("villas");

  return { success: true };
}

export async function saveRoomGallery(
  roomId: string, 
  villaId: string, 
  items: Array<{ image_url: string; is_primary?: boolean | null; display_order?: number | null }>
) {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();
  if (!user) return { error: "Unauthorized: Please log in." };
  if (!isAdmin) return { error: "Forbidden: Admin access required." };

  const normalized = normalizeGalleryItems(items);

  // 1. Clear existing room gallery
  const { error: deleteError } = await supabase
    .from("gallery")
    .delete()
    .eq("room_type_id", roomId);
    
  if (deleteError) return { error: deleteError.message };

  // 2. Insert new gallery
  if (normalized.length > 0) {
    const payload: GalleryInsert[] = normalized.map((img) => ({
      room_type_id: roomId,
      villa_id: villaId,
      image_url: img.image_url,
      is_primary: img.is_primary,
      display_order: img.display_order,
    }));
    
    const { error: insertError } = await supabase
      .from("gallery")
      .insert(payload);
      
    if (insertError) return { error: insertError.message };
  }

  await logAudit(supabase, "UPDATE_GALLERY", "room_types", roomId, null, { gallery: normalized }, user.id);
  
  revalidatePath("/admin/villas");
  revalidateTag("villas");

  return { success: true };
}

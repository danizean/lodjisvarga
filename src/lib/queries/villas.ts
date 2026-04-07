import { createClient } from "@/lib/supabase/server";

export async function getAdminVillasWithRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select(`
      *,
      room_types (*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAdminVillaById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select(`
      *,
      room_types (*)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getRoomTypeById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("room_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

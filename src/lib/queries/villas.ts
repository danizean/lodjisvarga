import { createClient } from "@/lib/supabase/server";

// ─── Admin Villas List ────────────────────────────────────────────────────────
export async function getAdminVillasWithRooms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select(`
      *,
      room_types (*),
      gallery (*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Single Villa for Edit Form ───────────────────────────────────────────────
export async function getAdminVillaById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select(`
      *,
      villa_amenities (amenity_id),
      gallery (*),
      room_types (
        *,
        room_type_amenities (amenity_id),
        gallery (*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

// ─── Dashboard Statistics ─────────────────────────────────────────────────────
export async function getDashboardStats() {
  const supabase = await createClient();

  const [villasRes, leadsRes, promosRes] = await Promise.all([
    supabase.from("villas").select("id, status", { count: "exact" }).eq("status", "active"),
    supabase.from("leads").select("id", { count: "exact" }).eq("status", "New"),
    supabase.from("promos").select("id", { count: "exact" }).eq("is_active", true),
  ]);

  return {
    activeVillas: villasRes.count ?? 0,
    pendingLeads: leadsRes.count ?? 0,
    activePromos: promosRes.count ?? 0,
  };
}

// ─── All Amenities ────────────────────────────────────────────────────────────
export async function getAllAmenities() {
  const supabase = await createClient();
  const { data } = await supabase.from("amenities").select("*").order("name");
  return data ?? [];
}

// ─── Promos ───────────────────────────────────────────────────────────────────
export async function getAdminPromos() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promos")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// ─── Room type by ID ──────────────────────────────────────────────────────────
export async function getRoomTypeById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("room_types").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

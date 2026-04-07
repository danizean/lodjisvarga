import { createClient } from "@/lib/supabase/server";
import { FeaturedVillasClient } from "./FeaturedVillasClient";

export async function FeaturedVillas() {
  const supabase = await createClient();

  // Ambil SEMUA villa (active + coming_soon) beserta room types dan gallery per kamar
  const { data: villas, error } = await supabase
    .from("villas")
    .select(`
      id,
      name,
      slug,
      status,
      address,
      whatsapp_number,
      gmaps_url,
      description,
      room_types (
        id,
        name,
        base_price,
        capacity_adult,
        capacity_child,
        description,
        gallery (
          image_url,
          is_primary,
          display_order
        )
      ),
      villa_amenities (
        amenities (
          id,
          name,
          icon_name
        )
      )
    `)
    .in("status", ["active", "coming_soon"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase Fetch Error (FeaturedVillas):", error.message);
  }

  if (!villas || villas.length === 0) {
    return (
      <div className="py-20 text-center bg-[#F7F6F2]">
        <p className="text-slate-400 italic">No villas are currently available.</p>
      </div>
    );
  }

  return <FeaturedVillasClient villas={villas as any} />;
}
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data: villas, error } = await supabase
    .from("villas")
    .select(`
      id, name, slug, status, address, whatsapp_number, gmaps_url, description,
      room_types (
        id, name, status, base_price, bed_type, highlight_amenity_ids, description,
        gallery:gallery!gallery_room_type_id_fkey (
          image_url, is_primary, display_order
        ),
        room_type_amenities ( amenities ( id, name, icon_name ) )
      ),
      villa_amenities ( amenities ( id, name, icon_name ) )
    `)
    .in("status", ["active", "coming_soon"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("DB Error:", error);
    return;
  }

  for (const villa of villas ?? []) {
    console.log(`\n=== VILLA: ${villa.name} ===`);
    const vAmenities = villa.villa_amenities.flatMap((v: any) => v.amenities);
    console.log("Villa Amenities:", vAmenities.map((a: any) => a.name).join(", "));
    
    for (const room of villa.room_types ?? []) {
      console.log(`\n  ROOM: ${room.name}`);
      console.log(`  highlight_amenity_ids:`, room.highlight_amenity_ids);
      
      const rAmenities = room.room_type_amenities.flatMap((r: any) => r.amenities).filter(Boolean);
      console.log(`  Room Amenities:`, rAmenities.map((a: any) => a.name).join(", "));

      // Simulate mapping
      const combined = [...vAmenities, ...rAmenities].filter(Boolean);
      const combinedMap = new Map();
      combined.forEach(a => combinedMap.set(a.id, a));
      
      const selected = (room.highlight_amenity_ids || []).map((id: string) => combinedMap.get(id)).filter(Boolean);
      console.log(`  RESOLVED HIGHLIGHTS:`, selected.map((a: any) => a.name).join(", "));
    }
  }
}

run();

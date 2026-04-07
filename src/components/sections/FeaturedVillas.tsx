import { createClient } from "@/lib/supabase/server";
import { FeaturedVillasClient } from "./FeaturedVillasClient";

export async function FeaturedVillas() {
  const supabase = await createClient();
  
  // Mengambil data dengan filter status 'active' agar sinkron dengan aturan platform
  const { data: villas, error } = await supabase
    .from("villas")
    .select(`
      id,
      name,
      slug,
      status,
      address,
      whatsapp_number,
      room_types (
        base_price,
        capacity_adult,
        capacity_child
      ),
      gallery (
        image_url,
        is_primary
      ),
      villa_amenities (
        amenities (
          id,
          name,
          icon_name
        )
      )
    `)
    .eq("status", "active") // Filter: Hanya tampilkan yang sudah dipublish
    .order("created_at", { ascending: false }) // Urutkan dari yang terbaru
    .limit(9); // Menggunakan kelipatan 3 (grid layout) agar tampilan rapi

  // 1. Logging error untuk keperluan debugging admin (muncul di terminal)
  if (error) {
    console.error("Supabase Fetch Error (FeaturedVillas):", error.message);
  }

  // 2. Fallback UI: Jika tidak ada data, jangan biarkan aplikasi crash
  // Kita bisa mengirim array kosong, FeaturedVillasClient akan menangani "Empty State"-nya
  if (!villas || villas.length === 0) {
    return (
      <div className="py-20 text-center bg-[#F7F6F2]">
        <p className="text-slate-400 italic">No featured villas are currently available.</p>
      </div>
    );
  }

  // Cast as any jika TypeScript komplain tentang struktur nested join Supabase
  return <FeaturedVillasClient villas={villas as any} />;
}
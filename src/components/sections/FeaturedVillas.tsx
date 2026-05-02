"use server";

import { createClient } from "@/lib/supabase/server";
import { attachPublicPricing, getPublicPricingSnapshot } from "@/lib/queries/public-pricing";
import { FeaturedVillasClient } from "./FeaturedVillasClient";
import type { PublicRoomTypeData, PublicVillaData } from "@/types/public-villas";

/**
 * FeaturedVillas (Server Component)
 * Mengambil data villa dan harga secara efisien dari Supabase.
 */
export async function FeaturedVillas() {
  const supabase = await createClient();

  // 1. Query Data - Dioptimalkan untuk hanya mengambil field yang diperlukan UI
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

  // 2. Error Handling - Tampilan fallback yang lebih elegan
  if (error) {
    console.error("Supabase Error:", error.message);
    return (
      <section className="py-20 text-center bg-[#F7F6F2] border-y border-[#3A4A1F]/5">
        <p className="text-[#3A4A1F]/40 italic font-serif tracking-wide">
          Gagal menyelaraskan data vila. Harap segarkan halaman.
        </p>
      </section>
    );
  }

  // 3. Transformasi Data - Menyaring kamar yang tidak aktif
  const villasWithActiveRooms: PublicVillaData[] = (villas ?? []).map((villa) => ({
    ...villa,
    status: villa.status ?? "inactive",
    room_types: (villa.room_types ?? []).filter((room) => room.status !== "inactive"),
  }));

  // 4. Pengambilan Harga (Pricing & Promo Snapshot)
  const roomTypeIds = villasWithActiveRooms.flatMap((villa) =>
    (villa.room_types ?? []).map((room) => room.id)
  );

  const pricingSnapshot = await getPublicPricingSnapshot(supabase, roomTypeIds);

  // Log error pricing secara internal tanpa merusak UI pengguna
  if (pricingSnapshot.pricesError || pricingSnapshot.promosError) {
    console.warn("Pricing/Promo system partially unavailable");
  }

  // 5. Final Mapping - Menyatukan data vila dengan harga promo terupdate
  const villasFinal: PublicVillaData[] = villasWithActiveRooms.map((villa) => {
    const pricedRooms = attachPublicPricing(
      (villa.room_types ?? []) as PublicRoomTypeData[],
      pricingSnapshot.priceMap
    );

    return {
      ...villa,
      room_types: pricedRooms,
    };
  });

  // 6. Empty State - Dibuat tetap elegan sesuai brand style
  if (villasFinal.length === 0) {
    return (
      <section className="py-24 bg-[#F7F6F2] flex items-center justify-center">
        <div className="max-w-md text-center space-y-5 px-6">
          <div className="h-px w-12 bg-[#D4AF37] mx-auto" />
          <h3 className="font-serif text-3xl text-[#3A4A1F] leading-snug">
            Segera Hadir <br />
            <span className="italic text-[#D4AF37]">Unit Eksklusif Kami</span>
          </h3>
          <p className="text-gray-500 text-sm font-light leading-relaxed">
            Kami sedang memastikan setiap detail sempurna untuk kenyamanan Anda. 
            Nantikan koleksi vila private pool terbaik kami di Yogyakarta.
          </p>
        </div>
      </section>
    );
  }

  // 7. Output ke Client Component
  return (
    <FeaturedVillasClient
      villas={villasFinal}
      activePromo={pricingSnapshot.activePromo}
    />
  );
}
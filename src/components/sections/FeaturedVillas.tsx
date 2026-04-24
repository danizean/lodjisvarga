import { createClient } from "@/lib/supabase/server";
import { attachPublicPricing, getPublicPricingSnapshot } from "@/lib/queries/public-pricing";
import { FeaturedVillasClient } from "./FeaturedVillasClient";
import type { ActivePromoData, VillaData } from "./FeaturedVillasClient";

export async function FeaturedVillas() {
  const supabase = await createClient();

  // 1. Fetch Data Villa dengan Status Terfilter
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
        status,
        base_price,
        bed_type,
        highlight_amenity_ids,
        description,
        room_gallery:gallery!gallery_room_type_id_fkey (
          image_url,
          is_primary,
          display_order
        ),
        room_type_amenities (
          amenities (
            id,
            name,
            icon_name
          )
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

  // Handle Fetch Error
  if (error) {
    console.error("Supabase Fetch Error (FeaturedVillas):", error.message);
    return (
      <div className="py-20 text-center bg-[#F7F6F2]">
        <p className="text-[#3A4A1F]/50 italic font-serif">Maaf, gagal memuat data villa.</p>
      </div>
    );
  }

  // 2. Filter Room Types yang Aktif
  const villasWithActiveRooms = (villas ?? []).map((villa) => ({
    ...villa,
    room_types: (villa.room_types ?? []).filter((room) => room.status !== "inactive"),
  }));

  // 3. Integrasi Harga (Pricing Snapshot)
  const roomTypeIds = villasWithActiveRooms.flatMap((villa) => 
    villa.room_types.map((room) => room.id)
  );
  
  const pricingSnapshot = await getPublicPricingSnapshot(supabase, roomTypeIds);

  // Log Pricing Errors (tetap lanjut jika promo error)
  if (pricingSnapshot.pricesError) {
    console.error("Pricing Error:", pricingSnapshot.pricesError.message);
  }

  // 4. Transformasi Data Akhir (Mapping Room Gallery ke Gallery)
  const villasFinal = villasWithActiveRooms.map((villa) => {
    // Attach pricing ke room types
    const pricedRooms = attachPublicPricing(villa.room_types ?? [], pricingSnapshot.priceMap);

    return {
      ...villa,
      room_types: pricedRooms.map((room) => ({
        ...room,
        // Preserve USP fields through the pricing spread
        bed_type: room.bed_type ?? null,
        highlight_amenity_ids: (room as typeof room & { highlight_amenity_ids?: string[] }).highlight_amenity_ids ?? [],
        room_type_amenities: (room as typeof room & { room_type_amenities?: any[] }).room_type_amenities ?? [],
        // Mapping key gallery agar sesuai dengan kebutuhan Client Component
        gallery: room.room_gallery ?? [],
      })),
    };
  });

  // 5. Render States
  if (!villasFinal || villasFinal.length === 0) {
    return (
      <div className="py-24 text-center bg-[#F7F6F2]">
        <div className="max-w-md mx-auto space-y-4 px-6">
          <h3 className="font-serif text-2xl text-[#3A4A1F]">Belum Ada Unit Tersedia</h3>
          <p className="text-gray-500 text-sm font-light">
            Kami sedang menyiapkan unit terbaik untuk masa menginap Anda di Yogyakarta. 
            Silakan kembali beberapa saat lagi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FeaturedVillasClient
      villas={villasFinal as VillaData[]}
      activePromo={pricingSnapshot.activePromo as ActivePromoData}
    />
  );
}
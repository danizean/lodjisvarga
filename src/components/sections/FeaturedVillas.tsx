import { createClient } from "@/lib/supabase/server";
import { attachPublicPricing, getPublicPricingSnapshot } from "@/lib/queries/public-pricing";
import { FeaturedVillasClient } from "./FeaturedVillasClient";
import type { ActivePromoData, VillaData } from "./FeaturedVillasClient";

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
        status,
        base_price,
        capacity_adult,
        capacity_child,
        description,
        room_gallery:gallery!gallery_room_type_id_fkey (
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

  const villasWithActiveRooms = (villas ?? []).map((villa) => ({
    ...villa,
    room_types: (villa.room_types ?? []).filter((room) => room.status !== "inactive"),
  }));

  const roomTypeIds = villasWithActiveRooms.flatMap((villa) => villa.room_types.map((room) => room.id));
  const pricingSnapshot = await getPublicPricingSnapshot(supabase, roomTypeIds);

  if (pricingSnapshot.pricesError) {
    console.error("Supabase Fetch Error (Today Prices):", pricingSnapshot.pricesError.message);
  }
  if (pricingSnapshot.promosError) {
    console.error("Supabase Fetch Error (Active Promo):", pricingSnapshot.promosError.message);
  }

  const villasWithEffectivePrices = villasWithActiveRooms.map((villa) => ({
    ...villa,
    room_types: attachPublicPricing(villa.room_types ?? [], pricingSnapshot.priceMap).map((room) => ({
      ...room,
      gallery: room.room_gallery ?? [],
    })),
  }));

  if (!villas || villas.length === 0) {
    return (
      <div className="py-20 text-center bg-[#F7F6F2]">
        <p className="text-slate-400 italic">No villas are currently available.</p>
      </div>
    );
  }

  return (
    <FeaturedVillasClient
      villas={villasWithEffectivePrices as VillaData[]}
      activePromo={pricingSnapshot.activePromo as ActivePromoData}
    />
  );
}

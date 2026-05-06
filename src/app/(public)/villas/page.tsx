import type { Metadata } from "next";
import { VillasPageClient } from "@/components/features/villas/VillasPageClient";
import { attachPublicPricing, getPublicPricingSnapshot } from "@/lib/queries/public-pricing";
import { createClient } from "@/lib/supabase/server";
import type { PublicRoomTypeData, PublicVillaData } from "@/types/public-villas";

export const metadata: Metadata = {
  title: "Daftar Villa | Lodjisvarga",
  description:
    "Temukan villa dan kamar terbaik di Lodjisvarga. Nikmati pengalaman menginap premium dengan fasilitas lengkap di Yogyakarta.",
};

export const dynamic = "force-dynamic";

export default async function VillasPage() {
  const supabase = await createClient();

  const { data: villas, error } = await supabase
    .from("villas")
    .select(`
      id, name, slug, description, address, whatsapp_number, gmaps_url, status,
      villa_gallery:gallery!gallery_villa_id_fkey (image_url, is_primary, display_order, room_type_id),
      villa_amenities (amenities (id, name, icon_name)),
      room_types (
        id, name, status, base_price, highlight_amenity_ids,
        bed_type, capacity_adult, capacity_child, description,
        gallery:gallery!gallery_room_type_id_fkey (image_url, is_primary, display_order),
        room_type_amenities (amenities (id, name, icon_name))
      )
    `)
    .in("status", ["active", "coming_soon"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase Fetch Error (Villas Listing):", error.message);
  }

  const villasWithActiveRooms: PublicVillaData[] = (villas ?? []).map((villa) => ({
    ...villa,
    status: villa.status ?? "inactive",
    room_types: (villa.room_types ?? []).filter((room) => room.status !== "inactive"),
  }));

  const roomTypeIds = villasWithActiveRooms.flatMap((villa) =>
    (villa.room_types ?? []).map((room) => room.id)
  );

  const pricingSnapshot = await getPublicPricingSnapshot(supabase, roomTypeIds);

  if (pricingSnapshot.pricesError) {
    console.error("Supabase Fetch Error (Villas Listing Prices):", pricingSnapshot.pricesError.message);
  }

  if (pricingSnapshot.promosError) {
    console.error("Supabase Fetch Error (Villas Listing Promo):", pricingSnapshot.promosError.message);
  }

  const villasFinal: PublicVillaData[] = villasWithActiveRooms.map((villa) => ({
    ...villa,
    room_types: attachPublicPricing(
      (villa.room_types ?? []) as PublicRoomTypeData[],
      pricingSnapshot.priceMap
    ),
  }));

  return <VillasPageClient villas={villasFinal} activePromo={pricingSnapshot.activePromo} />;
}

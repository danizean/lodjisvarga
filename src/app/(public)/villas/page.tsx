import type { Metadata } from "next";
import { createStaticClient } from "@/lib/supabase/static";
import { VillasPageClient } from "@/components/features/villas/VillasPageClient";

export const metadata: Metadata = {
  title: "Daftar Villa | Lodjisvarga",
  description:
    "Temukan villa dan kamar terbaik di Lodjisvarga. Nikmati pengalaman menginap premium dengan fasilitas lengkap di Yogyakarta.",
};

export const revalidate = 3600;

export default async function VillasPage() {
  const supabase = createStaticClient();

  const { data: villas } = await supabase
    .from("villas")
    .select(`
      id, name, slug, description, address, whatsapp_number, status,
      villa_gallery:gallery!gallery_villa_id_fkey (image_url, is_primary, display_order, room_type_id),
      villa_amenities (amenities (id, name, icon_name)),
      room_types (
        id, name, status, base_price, highlight_amenity_ids,
        bed_type, capacity_adult, capacity_child, description,
        room_gallery:gallery!gallery_room_type_id_fkey (image_url, is_primary, display_order),
        room_type_amenities (amenities (id, name, icon_name))
      )
    `)
    .eq("status", "active")
    .order("name");

  const { data: promos } = await supabase
    .from("promos")
    .select("id, title, discount_code, discount_value, expired_at, is_active")
    .eq("is_active", true)
    .order("discount_value", { ascending: false })
    .limit(1);

  return (
    <VillasPageClient
      villas={(villas ?? []) as any}
      activePromo={(promos?.[0] ?? null) as any}
    />
  );
}

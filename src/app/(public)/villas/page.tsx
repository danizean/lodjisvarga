import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  attachPublicPricing,
  getPublicPricingSnapshot,
} from "@/lib/queries/public-pricing";
import type { VillaData, ActivePromoData } from "@/components/sections/FeaturedVillasClient";
import { VillasPageClient } from "@/components/features/villas/VillasPageClient";

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Our Villas",
  description:
    "Browse our collection of luxury villas at Lodji Svarga. Filter by location and discover your perfect stay in Yogyakarta.",
};

// ─── Page (SSR) ──────────────────────────────────────────────────────────────
export default async function VillasPage() {
  const supabase = await createClient();

  // 1. Fetch all villas (active + coming_soon) with room types & gallery
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

  // 2. Filter only active room types
  const villasWithActiveRooms = (villas ?? []).map((villa) => ({
    ...villa,
    room_types: (villa.room_types ?? []).filter(
      (room) => room.status !== "inactive"
    ),
  }));

  // 3. Pricing snapshot
  const roomTypeIds = villasWithActiveRooms.flatMap((v) =>
    v.room_types.map((r) => r.id)
  );
  const pricingSnapshot = await getPublicPricingSnapshot(supabase, roomTypeIds);

  // 4. Attach pricing & remap gallery key
  const villasFinal = villasWithActiveRooms.map((villa) => {
    const pricedRooms = attachPublicPricing(
      villa.room_types ?? [],
      pricingSnapshot.priceMap
    );
    return {
      ...villa,
      room_types: pricedRooms.map((room) => ({
        ...room,
        gallery: (room as typeof room & { room_gallery?: { image_url: string; is_primary: boolean | null; display_order: number | null }[] }).room_gallery ?? [],
      })),
    };
  });

  return (
    <>
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden bg-[#3A4A1F] pt-32 pb-20 md:pt-40 md:pb-28">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37]">
            Lodji Svarga Collection
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-white md:text-6xl">
            Villa{" "}
            <span className="italic text-[#D4AF37]">Eksklusif</span> Kami
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
            Temukan villa impian Anda di Yogyakarta — dari suasana pedesaan yang
            tenang hingga nuansa modern yang elegan.
          </p>

          {/* Stats strip */}
          <div className="mx-auto mt-10 flex max-w-xs flex-wrap items-center justify-center gap-8 md:max-w-none">
            {[
              { value: villasFinal.filter((v) => v.status === "active").length.toString(), label: "Villa Aktif" },
              { value: villasFinal.flatMap((v) => v.room_types).length.toString(), label: "Tipe Kamar" },
              { value: "4.9★", label: "Rating Tamu" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-serif text-3xl font-bold text-white">{value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Villa Grid (client-interactive) ── */}
      {error ? (
        <div className="py-32 text-center">
          <p className="text-[#3A4A1F]/50 italic font-serif">
            Maaf, gagal memuat data villa. Silakan coba lagi.
          </p>
        </div>
      ) : (
        <VillasPageClient
          villas={villasFinal as VillaData[]}
          activePromo={pricingSnapshot.activePromo as ActivePromoData}
        />
      )}
    </>
  );
}

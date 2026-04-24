import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import {
  attachPublicPricing,
  getJakartaDateKey as getPublicJakartaDateKey,
  getPublicPricingSnapshot,
} from "@/lib/queries/public-pricing";
import { ChevronLeft, Clock3, MapPin, Plane, TrainFront, Users, Wifi, CarFront, Ban, MessageCircle } from "lucide-react";
import { VillaDetailHero } from "@/components/villa/VillaDetailHero";
import { VillaBookingCard, VillaMobileBookingBar } from "@/components/villa/VillaBookingCard";
import { VillaKeyInfoGrid } from "@/components/villa/VillaKeyInfoGrid";
import { VillaGallery } from "@/components/features/villas/VillaGallery";
import { VillaFacilitiesGrid } from "@/components/villa/VillaFacilitiesGrid";
import { VillaUnitCard } from "@/components/villa/VillaUnitCard";
import { VillaDescriptionBlock } from "@/components/villa/VillaDescriptionBlock";
import { VillaSupportingAccordion } from "@/components/villa/VillaSupportingAccordion";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type TravelerFaq = {
  question: string;
  answer: string;
};

type StayRule = {
  title: string;
  detail: string;
  icon: typeof Clock3;
};

type NearbySpot = {
  label: string;
  distance: string;
  icon: typeof MapPin;
};

export const revalidate = 86400;
export const dynamicParams = true;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: villa } = await supabase
    .from("villas")
    .select("name, description, address")
    .eq("slug", slug)
    .single();

  if (!villa) return { title: "Villa Not Found" };

  return {
    title: villa.name,
    description: villa.description ?? `Temukan keindahan ${villa.name} di ${villa.address}.`,
  };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase.from("villas").select("slug").eq("status", "active");
  return (data ?? []).map((villa) => ({ slug: villa.slug }));
}

const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

const getJakartaDateKey = getPublicJakartaDateKey;

const DEFAULT_POPULAR_FACILITIES = [
  "AC",
  "WiFi gratis",
  "Kolam renang outdoor",
  "Parkir privat gratis",
  "Kamar mandi dalam",
  "Water heater",
  "Layanan kamar",
  "Dapur kecil",
];

const TRAVELER_FAQS: TravelerFaq[] = [
  {
    question: "Apakah tersedia sarapan?",
    answer:
      "Tersedia pilihan paket sarapan. Konfirmasi menu dan waktu saji bisa dilakukan langsung via WhatsApp setelah reservasi.",
  },
  {
    question: "Bagaimana akses parkir?",
    answer:
      "Tersedia area parkir privat di dalam properti — aman, tertutup, dan bebas biaya untuk tamu menginap.",
  },
  {
    question: "Apakah WiFi kencang?",
    answer:
      "Ya. WiFi berkecepatan tinggi tersedia di seluruh area properti — cocok untuk kerja remote maupun streaming.",
  },
  {
    question: "Check-in dan check-out jam berapa?",
    answer:
      "Check-in mulai pukul 14.00 WIB. Check-out pukul 12.00 WIB. Keduanya fleksibel — hubungi kami jika butuh penyesuaian.",
  },
  {
    question: "Bisakah minta early check-in atau late check-out?",
    answer:
      "Bisa, dengan konfirmasi terlebih dahulu. Early check-in dan late check-out tersedia sesuai ketersediaan kamar.",
  },
];

const STAY_RULES: StayRule[] = [
  {
    title: "Check-in mulai 14.00 WIB",
    detail: "Kedatangan lebih awal atau lebih malam? Konfirmasi terlebih dahulu dan kami akan usahakan yang terbaik.",
    icon: Clock3,
  },
  {
    title: "Properti bebas pesta",
    detail: "Dirancang untuk suasana menginap yang nyaman dan privat. Acara besar di luar skala keluarga perlu persetujuan khusus.",
    icon: Ban,
  },
  {
    title: "Reservasi per unit",
    detail: "Pilih tipe kamar sesuai kebutuhan, lalu kirim permintaan reservasi untuk cek ketersediaan tanggal Anda.",
    icon: Users,
  },
  {
    title: "Respons cepat via WhatsApp",
    detail: "Tim kami aktif dan siap membantu — dari konfirmasi tanggal, permintaan khusus, hingga info tambahan.",
    icon: MessageCircle,
  },
];

const NEARBY_SPOTS: NearbySpot[] = [
  { label: "Restoran & kafe lokal", distance: "150 – 300 m", icon: MapPin },
  { label: "Stasiun Tugu Yogyakarta", distance: "9 – 10 km", icon: TrainFront },
  { label: "Malioboro & pusat kota", distance: "± 11 km", icon: MapPin },
  { label: "Bandara YIA / Adisutjipto", distance: "16 – 40 km", icon: Plane },
];

function buildOverview(villaName: string, address: string | null, description: string | null) {
  if (description?.trim()) return description.trim();

  return `${villaName} adalah pilihan menginap privat di ${address ?? "Yogyakarta"} — tenang, nyaman, dan dekat dengan pusat kota. Cocok untuk staycation keluarga, pasangan, maupun perjalanan kerja. Nikmati fasilitas lengkap dalam suasana yang jauh dari keramaian.`;
}

const getCachedVillaDetail = unstable_cache(
  async (slug: string) => {
    // ✅ Uses createStaticClient — no cookies(), safe for unstable_cache
    const supabase = createStaticClient();
    const { data: villa, error } = await supabase
      .from("villas")
      .select(`
        id, name, slug, description, address, gmaps_url, whatsapp_number, status,
        villa_gallery:gallery!gallery_villa_id_fkey (image_url, is_primary, display_order, room_type_id),
        room_types (
          id, name, status, base_price, description, bed_type, highlight_amenity_ids,
          room_gallery:gallery!gallery_room_type_id_fkey (image_url, is_primary, display_order),
          room_type_amenities (amenities(id, name, icon_name))
        ),
        villa_amenities (
          amenities (id, name, icon_name)
        )
      `)
      .eq("slug", slug)
      .single();
      
    if (error || !villa) return null;
    return villa;
  },
  ['villa-detail'],
  {
    tags: ['villas'],
    revalidate: 86400 
  }
);

export default async function VillaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const villa = await getCachedVillaDetail(slug);

  if (!villa) notFound();

  const supabase = await createClient();

  const isComingSoon = villa.status === "coming_soon";
  const activeRoomTypes = villa.room_types.filter((roomType) => roomType.status !== "inactive");
  const roomTypeIds = activeRoomTypes.map((roomType) => roomType.id);
  const pricingSnapshot = await getPublicPricingSnapshot(supabase, roomTypeIds, getJakartaDateKey());

  if (pricingSnapshot.pricesError) {
    console.error("Supabase Fetch Error (Villa Detail Prices):", pricingSnapshot.pricesError.message);
  }

  if (pricingSnapshot.promosError) {
    console.error("Supabase Fetch Error (Villa Detail Promo):", pricingSnapshot.promosError.message);
  }

  const activePromo = pricingSnapshot.activePromo;
  const roomTypesWithPricing = attachPublicPricing(activeRoomTypes, pricingSnapshot.priceMap);
  const roomTypeOptions = roomTypesWithPricing.map((roomType) => roomType.name);

  // ── Gallery ──────────────────────────────────────────────────────────────────
  const villaPhotos = (villa.villa_gallery ?? [])
    .filter((photo) => !photo.room_type_id)
    .sort((left, right) => {
      if (left.is_primary && !right.is_primary) return -1;
      if (!left.is_primary && right.is_primary) return 1;
      return (left.display_order ?? 0) - (right.display_order ?? 0);
    })
    .map((photo) => ({
      url: photo.image_url,
      label: villa.name,
      category: "villa" as const,
    }));

  const roomPhotos = roomTypesWithPricing.flatMap((roomType) =>
    [...roomType.room_gallery]
      .sort((left, right) => {
        if (left.is_primary && !right.is_primary) return -1;
        if (!left.is_primary && right.is_primary) return 1;
        return (left.display_order ?? 0) - (right.display_order ?? 0);
      })
      .map((photo) => ({
        url: photo.image_url,
        label: roomType.name,
        category: "unit" as const,
      }))
  );

  const allGalleryItems = [...villaPhotos, ...roomPhotos];
  const heroPhoto = allGalleryItems[0]?.url ?? null;
  const overviewText = buildOverview(villa.name, villa.address, villa.description);
  const heroSummary =
    overviewText.length > 170 ? `${overviewText.slice(0, 170).trimEnd()}...` : overviewText;
  
  const amenityNames = (villa.villa_amenities ?? [])
    .map((item) => item.amenities?.name?.trim())
    .filter((name): name is string => Boolean(name));
  const allFacilities = Array.from(new Set([...amenityNames, ...DEFAULT_POPULAR_FACILITIES]));
  
  const guestSummary = `${roomTypesWithPricing.length} tipe kamar`;

  // ── Unit Cards ───────────────────────────────────────────────────────────────
  const unitCards = roomTypesWithPricing.map((roomType) => {
    const allAmenities = (roomType.room_type_amenities || [])
      .map((rta) => rta.amenities)
      .filter((a): a is NonNullable<typeof a> => a !== null && a !== undefined)
      .map((a) => ({
        id: a.id,
        name: a.name,
        icon_name: a.icon_name,
      }));

    const highlightIds: string[] = (roomType as any).highlight_amenity_ids || [];
    const highlightAmenities = highlightIds
      .map((id) => allAmenities.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)
      .slice(0, 3);

    return {
      id: roomType.id,
      name: roomType.name,
      base_price: roomType.base_price ?? 0,
      effective_price: roomType.effective_price ?? 0,
      price_source: roomType.price_source ?? "base",
      activePromo: activePromo,
      bed_type: roomType.bed_type ?? "Standard Bed",
      description: roomType.description ?? "",
      gallery: roomType.room_gallery || [],
      amenities: allAmenities,
      highlight_amenities: highlightAmenities,
      villaName: villa.name,
      villaSlug: villa.slug,
      villaStatus: villa.status,
      villaWhatsapp: villa.whatsapp_number,
    };
  });

  // ── Pricing ──────────────────────────────────────────────────────────────────
  const validPricedRooms = roomTypesWithPricing.filter(
    (rt) => (rt.effective_price ?? 0) > 0
  );

  const lowestPriceRoom = validPricedRooms.sort(
    (a, b) => (a.effective_price ?? 0) - (b.effective_price ?? 0)
  )[0];

  let startingPriceText = "Cek harga";
  if (lowestPriceRoom) {
    const baseEff = lowestPriceRoom.effective_price ?? 0;
    const discount = activePromo?.discount_value ?? 0;
    const finalPrice = discount > 0
      ? Math.max(0, Math.round(baseEff * (1 - discount / 100)))
      : baseEff;
    startingPriceText = formatIDR(finalPrice);
  }

  const keyInfoItems = [
    { label: "Check-in", value: "Mulai 14.00 WIB", icon: Clock3 },
    { label: "WiFi", value: "Gratis di area properti", icon: Wifi },
    { label: "Parkir", value: "Parkir privat tersedia", icon: CarFront },
    { label: "Kamar", value: `${roomTypesWithPricing.length} tipe kamar aktif`, icon: Users },
  ];

  // ── JSON-LD ──────────────────────────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": villa.name,
    "description": overviewText,
    "url": `https://lodjisvarga.com/villas/${villa.slug}`,
    "telephone": villa.whatsapp_number,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": villa.address,
      "addressLocality": "Yogyakarta",
      "addressCountry": "ID"
    },
    "image": allGalleryItems.map(item => item.url),
    "priceRange": startingPriceText,
    "amenityFeature": allFacilities.map(facility => ({
      "@type": "LocationFeatureSpecification",
      "name": facility,
      "value": true
    }))
  };

  return (

    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── 1. EMOTIONAL ENTRY: Full-width immersive hero ── */}
      <div className="relative">
        <VillaDetailHero
          name={villa.name}
          address={villa.address}
          summary={heroSummary}
          heroPhoto={heroPhoto}
          galleryPreview={allGalleryItems}
          isComingSoon={isComingSoon}
          startingPriceText={startingPriceText}
          guestSummary={guestSummary}
          totalPhotos={allGalleryItems.length}
        />

        {/* Back link — floated over the hero */}
        <div className="absolute left-4 top-20 z-30 sm:left-6 lg:left-8">
          <Link
            href="/#featured-villas"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </div>

      {/* ── Anchor navigation strip — mobile quick-jump ── */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6">
          {[
            { href: "#units", label: "Pilih Kamar" },
            { href: "#gallery", label: "Galeri" },
            { href: "#facilities", label: "Fasilitas" },
            { href: "#info", label: "Info" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex-shrink-0 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-[#3A4A1F] hover:text-[#3A4A1F]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="bg-[#FAF8F4] pb-28 lg:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── 2-column layout: content | sticky sidebar ── */}
          <div className="pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">

            {/* ── LEFT: Main content column ── */}
            <div className="space-y-6">

              {/* ─────────────────────────────────────────────────────────────
                  BLOCK 1 — UNIT SELECTION (primary conversion block)
                  Moved to top: guests arrive to answer "what can I book?"
                  ───────────────────────────────────────────────────────────── */}
              {unitCards.length > 0 && (
                <section
                  id="units"
                  aria-labelledby="units-heading"
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">
                      Pilih Kamar Anda
                    </p>
                    <h2
                      id="units-heading"
                      className="mt-2 text-2xl font-black tracking-tight text-slate-950"
                    >
                      {unitCards.length === 1
                        ? "1 unit eksklusif tersedia"
                        : `${unitCards.length} pilihan unit — cari yang paling cocok`}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      Bandingkan tipe kamar, fasilitas, dan harga. Booking langsung via WhatsApp.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {unitCards.map((unit) => (
                      <VillaUnitCard key={unit.id} room={unit} />
                    ))}
                  </div>
                </section>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  BLOCK 2 — KEY INFO (quick facts that validate the choice)
                  After rooms: user now wants to confirm their mental model.
                  ───────────────────────────────────────────────────────────── */}
              <VillaKeyInfoGrid items={keyInfoItems} />

              {/* ─────────────────────────────────────────────────────────────
                  BLOCK 3 — GALLERY (visual evidence)
                  After units: user wants to see the spaces they are choosing.
                  ───────────────────────────────────────────────────────────── */}
              {allGalleryItems.length > 0 && (
                <section id="gallery">
                  <VillaGallery items={allGalleryItems} />
                </section>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  BLOCK 4 — DESCRIPTION (supporting context, kept secondary)
                  Short paragraph-split copy — adds character, not friction.
                  ───────────────────────────────────────────────────────────── */}
              <VillaDescriptionBlock text={overviewText} />

              {/* ─────────────────────────────────────────────────────────────
                  BLOCK 5 — FACILITIES (trust layer)
                  User is already interested — facilities confirm the decision.
                  ───────────────────────────────────────────────────────────── */}
              <section id="facilities">
                <VillaFacilitiesGrid facilities={allFacilities} />
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  BLOCK 6 — SUPPORTING INFO (rules, FAQ, nearby)
                  Last — only the most engaged guests will read this far.
                  ───────────────────────────────────────────────────────────── */}
              <section id="info">
                <VillaSupportingAccordion
                  faqs={TRAVELER_FAQS}
                  rules={STAY_RULES}
                  nearby={NEARBY_SPOTS}
                />
              </section>
            </div>

            {/* ── RIGHT: Sticky booking sidebar (desktop only) ── */}
            <aside
              className="hidden lg:block lg:sticky lg:top-8"
              aria-label="Booking sidebar"
            >
              <VillaBookingCard
                villaName={villa.name}
                whatsappNumber={villa.whatsapp_number}
                roomTypeOptions={roomTypeOptions}
                startingPriceText={startingPriceText}
                guestSummary={guestSummary}
                roomCount={roomTypesWithPricing.length}
                isComingSoon={isComingSoon}
              />
            </aside>
          </div>
        </div>
      </div>

      {/* ── Mobile sticky bottom bar (hidden on desktop) ── */}
      <VillaMobileBookingBar
        villaName={villa.name}
        whatsappNumber={villa.whatsapp_number}
        roomTypeOptions={roomTypeOptions}
        startingPriceText={startingPriceText}
        isComingSoon={isComingSoon}
      />
    </>
  );
}
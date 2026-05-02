import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Ban,
  CarFront,
  ChevronLeft,
  Clock3,
  MapPin,
  MessageCircle,
  Plane,
  TrainFront,
  Users,
  Wifi,
} from "lucide-react";
import { VillaDescriptionBlock } from "@/components/villa/VillaDescriptionBlock";
import { VillaDetailHero } from "@/components/villa/VillaDetailHero";
import { VillaFacilitiesGrid } from "@/components/villa/VillaFacilitiesGrid";
import { VillaKeyInfoGrid } from "@/components/villa/VillaKeyInfoGrid";
import { VillaSupportingAccordion } from "@/components/villa/VillaSupportingAccordion";
import { VillaUnitCard } from "@/components/villa/VillaUnitCard";
import { VillaGallery } from "@/components/features/villas/VillaGallery";
import { SITE_URL } from "@/lib/constants/site";
import {
  buildDetailGalleryItems,
  mapRoomTypesToUnitCards,
  resolveRoomDisplayPricing,
} from "@/lib/mappers/public-villas";
import {
  attachPublicPricing,
  getJakartaDateKey as getPublicJakartaDateKey,
  getPublicPricingSnapshot,
} from "@/lib/queries/public-pricing";
import { createStaticClient } from "@/lib/supabase/static";
import type {
  ActivePromoData,
  AmenityData,
  PublicRoomTypeData,
  PublicVillaData,
} from "@/types/public-villas";

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

const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const getJakartaDateKey = getPublicJakartaDateKey;

const TRAVELER_FAQS: TravelerFaq[] = [
  {
    question: "Apakah tersedia sarapan?",
    answer:
      "Tersedia pilihan paket sarapan. Konfirmasi menu dan waktu saji bisa dilakukan langsung via WhatsApp setelah reservasi.",
  },
  {
    question: "Bagaimana akses parkir?",
    answer:
      "Tersedia area parkir privat di dalam properti - aman, tertutup, dan bebas biaya untuk tamu menginap.",
  },
  {
    question: "Apakah WiFi kencang?",
    answer:
      "Ya. WiFi berkecepatan tinggi tersedia di seluruh area properti - cocok untuk kerja remote maupun streaming.",
  },
  {
    question: "Check-in dan check-out jam berapa?",
    answer:
      "Check-in mulai pukul 14.00 WIB. Check-out pukul 12.00 WIB. Keduanya fleksibel - hubungi kami jika butuh penyesuaian.",
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
    detail:
      "Kedatangan lebih awal atau lebih malam? Konfirmasi terlebih dahulu dan kami akan usahakan yang terbaik.",
    icon: Clock3,
  },
  {
    title: "Properti bebas pesta",
    detail:
      "Dirancang untuk suasana menginap yang nyaman dan privat. Acara besar di luar skala keluarga perlu persetujuan khusus.",
    icon: Ban,
  },
  {
    title: "Reservasi per unit",
    detail:
      "Pilih tipe kamar sesuai kebutuhan, lalu kirim permintaan reservasi untuk cek ketersediaan tanggal Anda.",
    icon: Users,
  },
  {
    title: "Respons cepat via WhatsApp",
    detail:
      "Tim kami aktif dan siap membantu - dari konfirmasi tanggal, permintaan khusus, hingga info tambahan.",
    icon: MessageCircle,
  },
];

const NEARBY_SPOTS: NearbySpot[] = [
  { label: "Restoran & kafe lokal", distance: "150 - 300 m", icon: MapPin },
  { label: "Stasiun Tugu Yogyakarta", distance: "9 - 10 km", icon: TrainFront },
  { label: "Malioboro & pusat kota", distance: "+/- 11 km", icon: MapPin },
  { label: "Bandara YIA / Adisutjipto", distance: "16 - 40 km", icon: Plane },
];

function buildOverview(villaName: string, address: string | null, description: string | null) {
  if (description?.trim()) return description.trim();

  return `${villaName} adalah pilihan menginap privat di ${
    address ?? "Yogyakarta"
  } - tenang, nyaman, dan dekat dengan pusat kota. Cocok untuk staycation keluarga, pasangan, maupun perjalanan kerja. Nikmati fasilitas lengkap dalam suasana yang jauh dari keramaian.`;
}

const getCachedVillaDetail = (slug: string) =>
  unstable_cache(
    async () => {
      const supabase = createStaticClient();
      const { data: villa, error } = await supabase
        .from("villas")
        .select(`
          id, name, slug, description, address, gmaps_url, whatsapp_number, status,
          villa_gallery:gallery!gallery_villa_id_fkey (image_url, is_primary, display_order, room_type_id),
          room_types (
            id, name, status, base_price, description, bed_type, capacity_adult, capacity_child, highlight_amenity_ids,
            gallery:gallery!gallery_room_type_id_fkey (image_url, is_primary, display_order),
            room_type_amenities (amenities(id, name, icon_name))
          ),
          villa_amenities (
            amenities (id, name, icon_name)
          )
        `)
        .eq("slug", slug)
        .in("status", ["active", "coming_soon"])
        .single();

      if (error || !villa) return null;

      const normalizedVilla: PublicVillaData = {
        ...villa,
        status: villa.status ?? "inactive",
        room_types: villa.room_types ?? [],
      };

      return normalizedVilla;
    },
    ["villa-detail", slug],
    { tags: ["villas"], revalidate: 86400 }
  )();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createStaticClient();
  const { data: villa } = await supabase
    .from("villas")
    .select(`
      name, slug, description, address,
      villa_gallery:gallery!gallery_villa_id_fkey (image_url, is_primary, display_order, room_type_id)
    `)
    .eq("slug", slug)
    .in("status", ["active", "coming_soon"])
    .single();

  if (!villa) {
    return {
      title: "Villa Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    villa.description?.trim() ??
    `Temukan keindahan ${villa.name} di ${villa.address ?? "Yogyakarta"}.`;
  const canonicalUrl = `${SITE_URL}/villas/${villa.slug}`;
  const ogImage = (villa.villa_gallery ?? [])
    .filter((item) => !item.room_type_id && Boolean(item.image_url))
    .sort((left, right) => {
      if (left.is_primary && !right.is_primary) return -1;
      if (!left.is_primary && right.is_primary) return 1;
      return (left.display_order ?? 0) - (right.display_order ?? 0);
    })[0]?.image_url;

  return {
    title: `${villa.name} | Lodjisvarga`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${villa.name} | Lodjisvarga`,
      description,
      url: canonicalUrl,
      type: "website",
      locale: "id_ID",
      siteName: "Lodjisvarga",
      images: ogImage ? [{ url: ogImage, alt: villa.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${villa.name} | Lodjisvarga`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("villas")
    .select("slug")
    .in("status", ["active", "coming_soon"]);
  return (data ?? []).map((villa) => ({ slug: villa.slug }));
}

export default async function VillaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const villa = await getCachedVillaDetail(slug);

  if (!villa || villa.status === "inactive") {
    notFound();
  }

  const isComingSoon = villa.status === "coming_soon";
  const activeRoomTypes = (villa.room_types ?? []).filter((roomType) => roomType.status !== "inactive");
  const roomTypeIds = activeRoomTypes.map((roomType) => roomType.id);

  const supabase = createStaticClient();
  const pricingSnapshot = await getPublicPricingSnapshot(supabase, roomTypeIds, getJakartaDateKey());

  if (pricingSnapshot.pricesError) {
    console.error("Supabase Fetch Error (Villa Detail Prices):", pricingSnapshot.pricesError.message);
  }
  if (pricingSnapshot.promosError) {
    console.error("Supabase Fetch Error (Villa Detail Promo):", pricingSnapshot.promosError.message);
  }

  const activePromo = pricingSnapshot.activePromo as ActivePromoData;
  const roomTypesWithPricing = attachPublicPricing(
    activeRoomTypes as PublicRoomTypeData[],
    pricingSnapshot.priceMap
  );

  const allGalleryItems = buildDetailGalleryItems({
    villaName: villa.name,
    villaGallery: villa.villa_gallery ?? [],
    roomTypes: roomTypesWithPricing,
  });

  const unitCards = mapRoomTypesToUnitCards({
    villa: {
      name: villa.name,
      slug: villa.slug,
      status: villa.status,
      whatsapp_number: villa.whatsapp_number,
    },
    roomTypes: roomTypesWithPricing,
    activePromo,
  });

  const heroPhoto = allGalleryItems[0]?.url ?? null;
  const overviewText = buildOverview(villa.name, villa.address, villa.description);
  const heroSummary =
    overviewText.length > 170 ? `${overviewText.slice(0, 170).trimEnd()}...` : overviewText;

  const propertyAmenities: AmenityData[] = (villa.villa_amenities ?? [])
    .flatMap((item) => (item.amenities ? [item.amenities] : []))
    .filter((amenity): amenity is AmenityData => Boolean(amenity?.id && amenity?.name));

  const allFacilityNames = Array.from(
    new Set([
      ...propertyAmenities.map((amenity) => amenity.name),
      ...roomTypesWithPricing.flatMap((roomType) =>
        (roomType.room_type_amenities ?? [])
          .flatMap((item) => (item.amenities?.name ? [item.amenities.name] : []))
      ),
    ])
  );

  const guestSummary = `${roomTypesWithPricing.length} tipe kamar`;

  const validRoomPricing = unitCards
    .map((room) => resolveRoomDisplayPricing(room))
    .filter((pricing) => pricing.hasManagedPrice);

  const lowestFinalPrice =
    validRoomPricing.length > 0
      ? Math.min(...validRoomPricing.map((pricing) => pricing.finalPrice))
      : null;

  const startingPriceText =
    lowestFinalPrice !== null && lowestFinalPrice > 0 ? formatIDR(lowestFinalPrice) : "Cek harga";

  const keyInfoItems = [
    { label: "Check-in", value: "Mulai 14.00 WIB", icon: Clock3 },
    { label: "WiFi", value: "Gratis di area properti", icon: Wifi },
    { label: "Parkir", value: "Parkir privat tersedia", icon: CarFront },
    { label: "Kamar", value: `${roomTypesWithPricing.length} tipe kamar aktif`, icon: Users },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: villa.name,
    description: overviewText,
    url: `${SITE_URL}/villas/${villa.slug}`,
    telephone: villa.whatsapp_number,
    address: {
      "@type": "PostalAddress",
      streetAddress: villa.address,
      addressLocality: "Yogyakarta",
      addressCountry: "ID",
    },
    image: allGalleryItems.map((item) => item.url),
    priceRange: startingPriceText,
    amenityFeature: allFacilityNames.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

      <div className="relative bg-[#FAF8F4] pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 pt-8">
            {unitCards.length > 0 ? (
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
                      : `${unitCards.length} pilihan unit - cari yang paling cocok`}
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
            ) : null}

            <VillaKeyInfoGrid items={keyInfoItems} />

            {allGalleryItems.length > 0 ? (
              <section id="gallery">
                <VillaGallery items={allGalleryItems} />
              </section>
            ) : null}

            <VillaDescriptionBlock text={overviewText} />

            <section id="facilities">
              <VillaFacilitiesGrid amenities={propertyAmenities} />
            </section>

            <section id="info">
              <VillaSupportingAccordion
                faqs={TRAVELER_FAQS}
                rules={STAY_RULES}
                nearby={NEARBY_SPOTS}
              />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

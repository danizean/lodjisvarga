import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import {
  attachPublicPricing,
  getJakartaDateKey as getPublicJakartaDateKey,
  getPublicPricingSnapshot,
} from "@/lib/queries/public-pricing";
import { ChevronLeft, Clock3, MapPin, Plane, TrainFront, Users, Wifi, CarFront } from "lucide-react";
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

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
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
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("villas").select("slug").eq("status", "active");
  return (data ?? []).map((villa) => ({ slug: villa.slug }));
}

const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

const getJakartaDateKey = getPublicJakartaDateKey;

const DEFAULT_POPULAR_FACILITIES = [
  "Kolam renang outdoor",
  "WiFi gratis",
  "Parkir gratis",
  "Kamar bebas rokok",
  "Layanan kamar",
  "Dapur kecil",
  "Kamar mandi pribadi",
  "AC",
];

const TRAVELER_FAQS: TravelerFaq[] = [
  {
    question: "Apakah properti menyediakan sarapan?",
    answer:
      "Pilihan sarapan dapat disesuaikan dengan operasional properti. Hubungi tim reservasi untuk detail menu dan ketersediaannya pada tanggal menginap Anda.",
  },
  {
    question: "Apakah tersedia parkir di area villa?",
    answer:
      "Ya, tersedia area parkir privat di properti. Informasi kapasitas parkir dan akses kendaraan dapat dikonfirmasi saat reservasi.",
  },
  {
    question: "Bagaimana kebijakan WiFi di properti?",
    answer:
      "Akses WiFi tersedia untuk mendukung kebutuhan staycation maupun work-from-anywhere selama menginap.",
  },
  {
    question: "Kapan waktu check-in dan check-out?",
    answer:
      "Check-in dimulai pukul 14.00 WIB. Detail check-out akan dikonfirmasi saat booking agar alur kedatangan dan kepulangan tetap nyaman.",
  },
];

const STAY_RULES: StayRule[] = [
  {
    title: "Check-in fleksibel",
    detail: "Standar check-in mulai pukul 14.00 WIB. Kedatangan di luar jam normal bisa dikonfirmasi terlebih dahulu.",
    icon: Clock3,
  },
  {
    title: "Tanpa pesta",
    detail: "Properti dirancang untuk suasana menginap yang tenang. Pesta atau acara besar perlu persetujuan khusus.",
    icon: Clock3,
  },
  {
    title: "Reservasi by unit",
    detail: "Pilih tipe kamar yang paling sesuai lalu kirim permintaan reservasi untuk cek ketersediaan.",
    icon: Users,
  },
  {
    title: "Konfirmasi cepat",
    detail: "Tim reservasi akan membantu kebutuhan tanggal inap, kapasitas, dan catatan tambahan melalui WhatsApp.",
    icon: Clock3,
  },
];

const NEARBY_SPOTS: NearbySpot[] = [
  { label: "Restoran lokal sekitar properti", distance: "150 - 300 m", icon: MapPin },
  { label: "Stasiun Tugu Yogyakarta", distance: "9 - 10 km", icon: TrainFront },
  { label: "Malioboro dan pusat kota", distance: "11 km", icon: MapPin },
  { label: "Bandara Adisutjipto", distance: "16 km", icon: Plane },
];

function buildOverview(villaName: string, address: string | null, description: string | null) {
  if (description?.trim()) return description.trim();

  return `${villaName} menghadirkan pengalaman menginap yang tenang di ${address ?? "Yogyakarta"} dengan suasana privat, area bersama yang nyaman, dan akses yang tetap praktis ke pusat kota maupun destinasi sekitar.`;
}

function getRoomOffer(effectivePrice: number, activePromo: { discount_value: number | null; discount_code: string } | null) {
  const safePrice = Math.max(0, effectivePrice);
  const discountPercentage = safePrice > 0 ? (activePromo?.discount_value ?? 0) : 0;
  const hasPromo = discountPercentage > 0 && safePrice > 0;
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(safePrice * (1 - discountPercentage / 100)))
    : safePrice;

  return {
    safePrice,
    hasPromo,
    finalPrice,
    hasManagedPrice: safePrice > 0,
    promoText: hasPromo ? `${activePromo?.discount_code} -${discountPercentage}%` : null,
    badgeText: safePrice > 0 ? "Harga hari ini" : null,
  };
}

export default async function VillaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: villa, error } = await supabase
    .from("villas")
    .select(`
      id, name, slug, description, address, gmaps_url, whatsapp_number, status,
      villa_gallery:gallery!gallery_villa_id_fkey (image_url, is_primary, display_order, room_type_id),
      room_types (
        id, name, status, base_price, capacity_adult, capacity_child, description,
        room_gallery:gallery!gallery_room_type_id_fkey (image_url, is_primary, display_order)
      ),
      villa_amenities (
        amenities (id, name, icon_name)
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !villa) notFound();

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

  const villaPhotos = [...(villa.villa_gallery ?? [])]
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
  const maxAdults = roomTypesWithPricing.reduce((highest, roomType) => Math.max(highest, roomType.capacity_adult ?? 0), 0);
  const guestSummary = `Hingga ${Math.max(maxAdults, 2)} tamu`;

  const unitCards = roomTypesWithPricing.map((roomType) => {
    const offer = getRoomOffer(roomType.effective_price, activePromo);
    const primaryImage =
      roomType.room_gallery.find((photo) => photo.is_primary)?.image_url
      ?? roomType.room_gallery[0]?.image_url
      ?? null;

    return {
      id: roomType.id,
      name: roomType.name,
      description:
        roomType.description?.trim() ||
        "Unit kamar yang nyaman, mudah dipilih, dan cocok untuk tamu yang mencari stay privat dengan alur booking yang praktis.",
      imageUrl: primaryImage,
      guestText:
        (roomType.capacity_child ?? 0) > 0
          ? `${roomType.capacity_adult ?? 2} dewasa + ${roomType.capacity_child} anak`
          : `${roomType.capacity_adult ?? 2} dewasa`,
      photoCount: roomType.room_gallery.length,
      priceText: offer.hasManagedPrice ? formatIDR(offer.finalPrice) : "Cek harga",
      originalPriceText: offer.hasPromo ? formatIDR(offer.safePrice) : null,
      promoText: offer.promoText,
      badgeText: roomType.price_source === "override" ? offer.badgeText : null,
      hasManagedPrice: offer.hasManagedPrice,
    };
  });

  const numericLowestManagedPrice = roomTypesWithPricing
    .map((roomType) => getRoomOffer(roomType.effective_price, activePromo))
    .filter((offer) => offer.hasManagedPrice)
    .sort((left, right) => left.finalPrice - right.finalPrice)[0];

  const startingPriceText = numericLowestManagedPrice
    ? formatIDR(numericLowestManagedPrice.finalPrice)
    : "Cek harga";

  const keyInfoItems = [
    { label: "Check-in", value: "Mulai 14.00 WIB", icon: Clock3 },
    { label: "WiFi", value: "Gratis di area properti", icon: Wifi },
    { label: "Parkir", value: "Parkir privat tersedia", icon: CarFront },
    { label: "Kamar", value: `${roomTypesWithPricing.length} tipe kamar aktif`, icon: Users },
  ];

  return (
    <div className="bg-[#FAF8F4] pb-24 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <Link
          href="/#featured-villas"
          className="relative z-30 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6">
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

            <VillaKeyInfoGrid items={keyInfoItems} />

            <VillaGallery items={allGalleryItems} />

            <VillaFacilitiesGrid facilities={allFacilities} />

            {unitCards.length > 0 && (
              <section id="units" className="space-y-4">
                <div className="px-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Unit Selection</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Pilih unit yang paling sesuai</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-500">
                    Unit ditampilkan singkat, dengan fokus pada foto, kapasitas, harga, dan tombol booking.
                  </p>
                </div>

                <div className="space-y-4">
                  {unitCards.map((unit) => (
                    <VillaUnitCard
                      key={unit.id}
                      villaName={villa.name}
                      whatsappNumber={villa.whatsapp_number}
                      roomTypeOptions={roomTypeOptions}
                      name={unit.name}
                      description={unit.description}
                      imageUrl={unit.imageUrl}
                      guestText={unit.guestText}
                      photoCount={unit.photoCount}
                      priceText={unit.priceText}
                      originalPriceText={unit.originalPriceText}
                      promoText={unit.promoText}
                      badgeText={unit.badgeText}
                      isComingSoon={isComingSoon}
                    />
                  ))}
                </div>
              </section>
            )}

            <VillaDescriptionBlock text={overviewText} />

            <VillaSupportingAccordion faqs={TRAVELER_FAQS} rules={STAY_RULES} nearby={NEARBY_SPOTS} />
          </div>

          <div className="lg:sticky lg:top-24">
            <VillaBookingCard
              villaName={villa.name}
              whatsappNumber={villa.whatsapp_number}
              roomTypeOptions={roomTypeOptions}
              startingPriceText={startingPriceText}
              guestSummary={guestSummary}
              roomCount={roomTypesWithPricing.length}
              isComingSoon={isComingSoon}
            />
          </div>
        </div>
      </div>

      <VillaMobileBookingBar
        villaName={villa.name}
        whatsappNumber={villa.whatsapp_number}
        roomTypeOptions={roomTypeOptions}
        startingPriceText={startingPriceText}
        isComingSoon={isComingSoon}
      />
    </div>
  );
}

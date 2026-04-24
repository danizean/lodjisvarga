"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, BedDouble, Sparkles, Clock } from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";

export type RoomTypeGalleryImage = {
  image_url: string;
  is_primary: boolean | null;
  display_order: number | null;
};

export type RoomTypeCardData = {
  id: string;
  name: string;
  base_price: number;
  effective_price?: number;
  price_source?: "base" | "override";
  activePromo?: {
    id: string;
    title: string;
    discount_code: string;
    discount_value: number | null;
    expired_at: string | null;
    is_active: boolean | null;
  } | null;
  bed_type?: string | null;
  amenities?: { name: string }[];
  highlight_amenities?: { id: string; name: string; icon_name: string | null }[];
  capacity_adult?: number | null;
  capacity_child?: number | null;
  description: string | null;
  gallery: RoomTypeGalleryImage[];
  // Villa info passed down
  villaName: string;
  villaSlug: string;
  villaStatus: "active" | "coming_soon" | "inactive" | string;
  villaWhatsapp: string | null;
};

const PLACEHOLDER = "/assets/placeholder-villa.webp";

const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

// ─── Dot Indicator ─────────────────────────────────────────────────────────
function DotIndicator({ count, current }: { count: number; current: number }) {
  if (count <= 1) return null;
  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`block rounded-full transition-all duration-300 ${
            i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}

// ─── VillaCard ──────────────────────────────────────────────────────────────
export function VillaCard({ room }: { room: RoomTypeCardData }) {
  const isComingSoon = room.villaStatus === "coming_soon";
  const effectivePrice = room.effective_price ?? 0;
  const discountPercentage = room.activePromo?.discount_value ?? 0;
  const hasPromo = discountPercentage > 0 && effectivePrice > 0;
  const hasManagedPrice = effectivePrice > 0;
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(effectivePrice * (1 - discountPercentage / 100)))
    : effectivePrice;

  // Resolved highlights from the server (max 3)
  const highlightAmenities = (room.highlight_amenities ?? []).slice(0, 3);

  // Legacy fallback: show Private Pool badge if no highlights are configured yet
  const legacyPoolBadge =
    highlightAmenities.length === 0 &&
    (room.amenities ?? []).some((a) =>
      a?.name?.toLowerCase().includes("pool")
    );

  // Sort gallery: primary first, then by display_order
  const roomImages = [...(room.gallery ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((g) => g.image_url);

  const imageList = roomImages.length > 0 ? roomImages : [PLACEHOLDER];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [current, setCurrent] = useState(0);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => { e.preventDefault(); emblaApi?.scrollPrev(); },
    [emblaApi]
  );
  const scrollNext = useCallback(
    (e: React.MouseEvent) => { e.preventDefault(); emblaApi?.scrollNext(); },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col transform hover:-translate-y-2 group">

      {/* ── Carousel Image ── */}
      <div className="relative h-64 overflow-hidden">
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {imageList.map((src, i) => (
              <div key={i} className="relative h-full flex-[0_0_100%] min-w-0">
                <Image
                  src={src}
                  alt={`${room.name} – photo ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Nav Arrows */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Dot Indicator */}
        <DotIndicator count={imageList.length} current={current} />

        {/* Coming Soon Overlay */}
        {isComingSoon && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 z-20">
            <Clock className="w-8 h-8 text-white/80" />
            <span className="text-white font-bold tracking-[0.3em] uppercase text-sm border border-white/60 px-5 py-2 rounded-full backdrop-blur-sm">
              Coming Soon
            </span>
          </div>
        )}

        {/* Rating Badge — only for active */}
        {!isComingSoon && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1 z-10 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#3A4A1F]" />
            4.9
          </div>
        )}

        {/* Image count badge */}
        {imageList.length > 1 && !isComingSoon && (
          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10">
            {current + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Villa Breadcrumb */}
        <p className="text-[10px] text-[#3A4A1F] font-bold tracking-widest uppercase mb-1">
          {room.villaName}
        </p>

        {/* Room Name */}
        <h3 className="font-serif text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {room.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-5 line-clamp-2 leading-relaxed flex-1">
          {room.description ?? `Nikmati kenyamanan eksklusif di ${room.villaName}.`}
        </p>

        {/* ── USP Row ── */}
        <div className="flex flex-col gap-2.5 mb-5 pb-5 border-b border-gray-100">
          {/* Bed type */}
          <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <BedDouble className="h-4 w-4 text-[#3A4A1F]" />
            {room.bed_type?.trim() || "Bed setup by request"}
          </p>

          {/* Dynamic highlighted amenities */}
          {highlightAmenities.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {highlightAmenities.map((amenity) => (
                <span
                  key={amenity.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200"
                >
                  <LucideDynamicIcon
                    iconName={amenity.icon_name}
                    className="h-3.5 w-3.5 text-[#3A4A1F]"
                  />
                  {amenity.name}
                </span>
              ))}
            </div>
          )}

          {/* Legacy fallback: Private Pool badge */}
          {legacyPoolBadge && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-900 ring-1 ring-inset ring-emerald-100">
                <LucideDynamicIcon iconName="waves" className="h-3.5 w-3.5" />
                Private Pool
              </span>
            </div>
          )}
        </div>

        {/* ── Pricing ── */}
        {isComingSoon ? (
          <div className="mt-auto space-y-4">
            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4 text-center">
              <p className="text-sm text-gray-500 font-medium">Harga akan segera diumumkan</p>
              <p className="text-xs text-gray-400 mt-1">Daftarkan minat Anda via WhatsApp</p>
            </div>
            <WhatsAppMessageForm
              whatsappNumber={room.villaWhatsapp}
              villaName={room.villaName}
              roomTypeName={room.name}
              buttonLabel="Hubungi Kami"
              title={`Chat ${room.villaName}`}
              buttonClassName="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#25D366]/90 text-white text-sm font-bold transition-all hover:bg-[#128C7E]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z"/></svg>
              Hubungi Kami
            </WhatsAppMessageForm>
          </div>
        ) : (
          <div className="mt-auto space-y-4">
            {/* Price Display */}
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Mulai dari</span>
                <div className="text-right">
                  {hasPromo && (
                    <span className="block text-[11px] font-semibold text-gray-400 line-through">
                      {formatIDR(effectivePrice)}
                    </span>
                  )}
                  {hasManagedPrice ? (
                    <>
                      <span className="text-2xl font-bold text-[#3A4A1F]">{formatIDR(finalPrice)}</span>
                      <span className="text-xs text-gray-400 ml-1">/malam</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-slate-500">Hubungi Kami</span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {room.price_source === "override" && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                    Harga hari ini
                  </span>
                )}
                {hasPromo && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                    {room.activePromo?.discount_code} -{discountPercentage}%
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-400 text-right">
                {hasManagedPrice
                  ? "*Harga berubah otomatis sesuai tanggal dan promo aktif"
                  : "*Harga belum diatur untuk hari ini"}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <WhatsAppMessageForm
                whatsappNumber={room.villaWhatsapp}
                villaName={room.villaName}
                roomTypeName={room.name}
                buttonLabel="WhatsApp"
                title={`Pesan ${room.name}`}
                buttonClassName="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] text-white text-xs font-bold transition-all hover:bg-[#128C7E] shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z"/></svg>
                WhatsApp
              </WhatsAppMessageForm>
              <Link
                href={`/villas/${room.villaSlug}`}
                className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-[#3A4A1F] text-white text-xs font-bold transition-all hover:bg-[#2A3A1F] shadow-sm"
              >
                Selengkapnya
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

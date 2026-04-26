"use client";

import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Clock,
  Tag,
  ArrowRight,
} from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  amenities?: { id?: string; name: string; icon_name?: string | null }[];
  highlight_amenities?: { id: string; name: string; icon_name: string | null }[];
  capacity_adult?: number | null;
  capacity_child?: number | null;
  description: string | null;
  gallery: RoomTypeGalleryImage[];
  // Villa info
  villaName: string;
  villaSlug: string;
  villaStatus: "active" | "coming_soon" | "inactive" | string;
  villaWhatsapp: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 pointer-events-none z-10">
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

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────

const WhatsAppIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
  </svg>
);

// ─── VillaCard ───────────────────────────────────────────────────────────────

export function VillaCard({ room }: { room: RoomTypeCardData }) {
  const isComingSoon = room.villaStatus === "coming_soon";
  const effectivePrice = room.effective_price ?? 0;
  const discountPercentage = room.activePromo?.discount_value ?? 0;
  const hasPromo = discountPercentage > 0 && effectivePrice > 0;
  const hasManagedPrice = effectivePrice > 0;
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(effectivePrice * (1 - discountPercentage / 100)))
    : effectivePrice;

  // Amenity display: prefer highlights, fall back to all amenities
  const highlightAmenities = (room.highlight_amenities ?? []).slice(0, 3);
  const allAmenities = (room.amenities ?? []) as {
    id?: string;
    name: string;
    icon_name?: string | null;
  }[];
  const displayAmenities =
    highlightAmenities.length > 0
      ? highlightAmenities
      : allAmenities.filter((a) => a.name);
  const visibleChips = displayAmenities.slice(0, 4);
  const overflow = Math.max(0, displayAmenities.length - 4);

  const legacyPoolBadge =
    displayAmenities.length === 0 &&
    allAmenities.some((a) => a?.name?.toLowerCase().includes("pool"));

  // Gallery
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
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200">

      {/* ── Image carousel ── */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <div ref={emblaRef} className="h-full overflow-hidden">
          <div className="flex h-full">
            {imageList.map((src, i) => (
              <div key={i} className="relative h-full flex-[0_0_100%] min-w-0">
                <Image
                  src={src}
                  alt={`${room.name} – foto ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Gradient overlay for readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Nav arrows */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2.5 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:bg-black/60"
              aria-label="Foto sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:bg-black/60"
              aria-label="Foto berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <DotIndicator count={imageList.length} current={current} />

        {/* Coming soon overlay */}
        {isComingSoon && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-black/55 backdrop-blur-sm">
            <Clock className="h-7 w-7 text-white/70" />
            <span className="rounded-full border border-white/50 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-white">
              Segera Hadir
            </span>
          </div>
        )}

        {/* Promo badge */}
        {hasPromo && (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
            <Tag className="h-3 w-3" />
            {room.activePromo?.discount_code} -{discountPercentage}%
          </div>
        )}

        {/* Photo counter */}
        {imageList.length > 1 && !isComingSoon && (
          <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {current + 1}/{imageList.length}
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">

        {/* Villa breadcrumb */}
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]">
          {room.villaName}
        </p>

        {/* Room name */}
        <h3 className="text-lg font-black tracking-tight text-slate-900 line-clamp-1">
          {room.name}
        </h3>

        {/* Bed type */}
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
          <BedDouble className="h-3.5 w-3.5 flex-shrink-0 text-[#3A4A1F]" />
          {room.bed_type?.trim() || "Bed setup by request"}
        </p>

        {/* Description */}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {room.description ?? `Nikmati kenyamanan eksklusif di ${room.villaName}.`}
        </p>

        {/* ── Amenity chips ── */}
        {(visibleChips.length > 0 || legacyPoolBadge) && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {visibleChips.map((amenity, idx) => (
              <span
                key={(amenity as any).id ?? idx}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
              >
                <LucideDynamicIcon
                  iconName={(amenity as any).icon_name ?? null}
                  amenityName={amenity.name}
                  className="h-3 w-3 flex-shrink-0 text-[#3A4A1F]"
                />
                {amenity.name}
              </span>
            ))}
            {overflow > 0 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                +{overflow} lainnya
              </span>
            )}
            {legacyPoolBadge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900">
                <LucideDynamicIcon iconName="waves" className="h-3 w-3" />
                Private Pool
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Price + CTAs ── */}
        <div className="mt-5 border-t border-slate-100 pt-5">
          {isComingSoon ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-sm font-medium text-slate-500">Harga akan segera diumumkan</p>
                <p className="mt-0.5 text-xs text-slate-400">Daftarkan minat Anda via WhatsApp</p>
              </div>
              <WhatsAppMessageForm
                whatsappNumber={room.villaWhatsapp}
                villaName={room.villaName}
                roomTypeName={room.name}
                buttonLabel="Hubungi Kami"
                title={`Chat ${room.villaName}`}
                buttonClassName="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-sm font-bold text-white transition-colors hover:bg-[#128C7E]"
              >
                <WhatsAppIcon />
                Hubungi Kami
              </WhatsAppMessageForm>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Price row */}
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Mulai dari
                  </p>
                  {hasPromo && (
                    <p className="mt-0.5 text-xs font-semibold text-slate-400 line-through">
                      {formatIDR(effectivePrice)}
                    </p>
                  )}
                  {hasManagedPrice ? (
                    <p className={`text-[22px] font-black leading-tight ${hasPromo ? "text-emerald-600" : "text-[#3A4A1F]"}`}>
                      {formatIDR(finalPrice)}
                      <span className="ml-1 text-sm font-normal text-slate-400">/malam</span>
                    </p>
                  ) : (
                    <p className="text-base font-bold text-slate-500">Hubungi kami</p>
                  )}
                </div>

                {/* Price badge pills */}
                <div className="flex flex-col items-end gap-1">
                  {room.price_source === "override" && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                      Harga hari ini
                    </span>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="grid grid-cols-2 gap-2">
                <WhatsAppMessageForm
                  whatsappNumber={room.villaWhatsapp}
                  villaName={room.villaName}
                  roomTypeName={room.name}
                  buttonLabel="WhatsApp"
                  title={`Pesan ${room.name}`}
                  buttonClassName="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#128C7E]"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </WhatsAppMessageForm>

                <Link
                  href={`/villas/${room.villaSlug}`}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#3A4A1F] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#2A3A0F]"
                >
                  Selengkapnya
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

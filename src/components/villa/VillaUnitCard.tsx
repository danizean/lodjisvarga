"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BedDouble, MessageCircle, CheckCircle2, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";
import type { RoomTypeCardData } from "@/components/features/villas/VillaCard";

interface VillaUnitCardProps {
  room: RoomTypeCardData;
}

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const FALLBACK_DESCRIPTION =
  "Unit premium yang dirancang untuk kenyamanan maksimal selama menginap.";

/** Inline mini-gallery for the unit card image panel. */
function UnitImageGallery({
  images,
  roomName,
}: {
  images: string[];
  roomName: string;
}) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50">
        <BedDouble className="h-10 w-10 text-slate-300" />
      </div>
    );
  }

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="group/img relative h-full w-full overflow-hidden">
      <Image
        src={images[current]}
        alt={`${roomName} – photo ${current + 1}`}
        fill
        className="object-cover transition-transform duration-500 group-hover/img:scale-105"
        sizes="(max-width: 1024px) 100vw, 288px"
      />

      {images.length > 1 && (
        <>
          {/* Prev/Next arrows — appear on hover */}
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/img:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/img:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-3.5 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Photo count badge */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            <Camera className="h-3 w-3" />
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

export function VillaUnitCard({ room }: VillaUnitCardProps) {
  const isComingSoon = room.villaStatus === "coming_soon";
  const effectivePrice = room.effective_price ?? 0;
  const discountPercentage = room.activePromo?.discount_value ?? 0;
  const hasPromo = discountPercentage > 0 && effectivePrice > 0;
  const hasManagedPrice = effectivePrice > 0;
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(effectivePrice * (1 - discountPercentage / 100)))
    : effectivePrice;

  // ── Gallery: all room photos sorted by primary → display_order ──────────────
  const sortedImages = [...(room.gallery ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((img) => img.image_url)
    .filter(Boolean);

  // ── Amenities: two-tier fallback ───────────────────────────────────────────
  const highlightAmenities = (room.highlight_amenities ?? [])
    .filter((a) => a?.id && a?.name)
    .slice(0, 4);

  const fallbackAmenities =
    highlightAmenities.length === 0
      ? (room.amenities ?? [])
          .filter((a): a is { name: string; icon_name?: string | null; id?: string } =>
            Boolean(a?.name)
          )
          .slice(0, 4)
      : [];

  const hasAnyAmenities =
    highlightAmenities.length > 0 || fallbackAmenities.length > 0;
  const totalAmenities = (room.amenities ?? []).length;
  const shownCount =
    highlightAmenities.length > 0
      ? highlightAmenities.length
      : fallbackAmenities.length;
  const remainingCount = Math.max(0, totalAmenities - shownCount);

  // ── Pricing ────────────────────────────────────────────────────────────────
  const priceText = hasManagedPrice ? formatIDR(finalPrice) : "Cek harga";
  const originalPriceText = hasPromo ? formatIDR(effectivePrice) : null;
  const promoText = hasPromo
    ? `${room.activePromo?.discount_code ?? "PROMO"} −${discountPercentage}%`
    : null;

  // ── Description ────────────────────────────────────────────────────────────
  const description = room.description?.trim() || FALLBACK_DESCRIPTION;

  return (
    <article
      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
      aria-label={room.name}
    >
      <div className="flex flex-col lg:flex-row">
        {/* ── Image panel ── */}
        <div className="relative h-64 flex-shrink-0 bg-slate-100 lg:h-auto lg:w-72">
          {/* Promo badge */}
          {promoText && (
            <div className="absolute left-3 top-3 z-20 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              {promoText}
            </div>
          )}
          <UnitImageGallery images={sortedImages} roomName={room.name} />
        </div>

        {/* ── Content panel ── */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {/* Header: name + price */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-black tracking-tight text-slate-950">
                {room.name}
              </h3>
              {/* Bed type */}
              <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-500">
                <BedDouble className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]" />
                {room.bed_type?.trim() || "Bed setup by request"}
              </p>
            </div>

            {/* Price block */}
            <div className="shrink-0 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 sm:min-w-[160px] sm:text-right">
              {originalPriceText && (
                <p className="text-xs font-semibold text-slate-400 line-through">
                  {originalPriceText}
                </p>
              )}
              <p className="text-2xl font-black text-[#3A4A1F]">{priceText}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                {hasManagedPrice ? "per malam" : "konfirmasi via WhatsApp"}
              </p>
            </div>
          </div>

          {/* Description — clamped for card context */}
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-500">
            {description}
          </p>

          {/* ── Amenities strip ── */}
          {hasAnyAmenities && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Fasilitas utama
              </p>
              <div className="flex flex-wrap gap-2">
                {highlightAmenities.length > 0
                  ? highlightAmenities.map((amenity) => (
                      <Badge
                        key={amenity.id}
                        variant="outline"
                        className="rounded-full border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                      >
                        <LucideDynamicIcon
                          iconName={amenity.icon_name}
                          className="mr-1.5 h-3.5 w-3.5 text-[#3A4A1F]"
                        />
                        {amenity.name}
                      </Badge>
                    ))
                  : fallbackAmenities.map((amenity, i) => (
                      <Badge
                        key={(amenity as any).id ?? i}
                        variant="outline"
                        className="rounded-full border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[#3A4A1F]" />
                        {amenity.name}
                      </Badge>
                    ))}

                {remainingCount > 0 && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500"
                  >
                    +{remainingCount} lainnya
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* ── Footer: disclaimer + CTA ── */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-400">
              {hasManagedPrice
                ? "* Harga dapat berubah sewaktu-waktu"
                : "* Harga belum tersedia untuk hari ini"}
            </p>

            {!isComingSoon && room.villaWhatsapp ? (
              <WhatsAppMessageForm
                whatsappNumber={room.villaWhatsapp}
                villaName={room.villaName}
                roomTypeName={room.name}
                buttonLabel="Pesan Sekarang"
                title={`Pesan ${room.name}`}
                buttonClassName="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1ebe5d]"
              >
                <MessageCircle className="h-4 w-4" />
                Pesan Sekarang
              </WhatsAppMessageForm>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">
                Reservasi belum dibuka
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

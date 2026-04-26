"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BedDouble,
  ChevronLeft,
  ChevronRight,
  Camera,
  Percent,
  MessageCircle,
  Info,
} from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";
import { RoomDetailModal } from "@/components/villa/RoomDetailModal";
import type { RoomTypeCardData } from "@/components/features/villas/VillaCard";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FALLBACK_IMG = "/assets/placeholder-villa.webp";

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

// ─── Image Gallery (card thumbnail) ──────────────────────────────────────────
function ThumbGallery({
  images,
  roomName,
  discountBadge,
}: {
  images: string[];
  roomName: string;
  discountBadge?: string | null;
}) {
  const [current, setCurrent] = useState(0);
  const list = images.length > 0 ? images : [FALLBACK_IMG];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((i) => (i === 0 ? list.length - 1 : i - 1));
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrent((i) => (i === list.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="group/img relative h-full w-full overflow-hidden bg-slate-100">
      <Image
        src={list[current]}
        alt={`${roomName} – foto ${current + 1}`}
        fill
        className="object-cover transition-transform duration-700 group-hover/img:scale-[1.06]"
        sizes="(max-width: 1024px) 100vw, 296px"
      />
      {/* bottom scrim */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
      {/* top scrim for badge */}
      {discountBadge && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/30 to-transparent" />
      )}

      {/* Discount badge */}
      {discountBadge && (
        <div className="absolute left-3 top-3 z-20 flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg">
          <Percent className="h-2.5 w-2.5" />
          {discountBadge}
        </div>
      )}

      {/* Nav arrows */}
      {list.length > 1 && (
        <>
          <button type="button" onClick={goPrev} aria-label="Foto sebelumnya"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition-all group-hover/img:opacity-100 hover:bg-white/40">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={goNext} aria-label="Foto berikutnya"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-md transition-all group-hover/img:opacity-100 hover:bg-white/40">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {list.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1 pointer-events-none">
          {list.map((_, i) => (
            <span key={i} className={`block rounded-full transition-all duration-300 ${
              i === current ? "w-3.5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
            }`} />
          ))}
        </div>
      )}

      {/* Photo counter */}
      <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        <Camera className="h-2.5 w-2.5" />
        {current + 1}/{list.length}
      </div>
    </div>
  );
}

// ─── Highlight Chip ───────────────────────────────────────────────────────────
function HighlightChip({
  name,
  iconName,
}: {
  name: string;
  iconName?: string | null;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3A4A1F]/6 px-3 py-1.5 text-[11px] font-semibold text-[#3A4A1F]">
      <LucideDynamicIcon
        iconName={iconName}
        amenityName={name}
        className="h-3 w-3 flex-shrink-0 text-[#3A4A1F]"
      />
      {name}
    </span>
  );
}

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────
const WaIcon = () => (
  <svg className="h-3.5 w-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
  </svg>
);

// ─── Main Card ────────────────────────────────────────────────────────────────
export function VillaUnitCard({ room }: { room: RoomTypeCardData }) {
  const isComingSoon = room.villaStatus === "coming_soon";
  const effectivePrice = room.effective_price ?? 0;
  const discountPct = room.activePromo?.discount_value ?? 0;
  const hasPromo = discountPct > 0 && effectivePrice > 0;
  const hasManagedPrice = effectivePrice > 0;
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(effectivePrice * (1 - discountPct / 100)))
    : effectivePrice;

  // Gallery
  const sortedImages = [...(room.gallery ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((img) => img.image_url)
    .filter(Boolean);

  // Highlights — from admin selection (max 4)
  // highlight_amenities is already resolved in page.tsx with fallback
  const highlights = (room.highlight_amenities ?? []) as {
    id?: string;
    name: string;
    icon_name?: string | null;
  }[];

  const discountBadge = hasPromo
    ? `${room.activePromo?.discount_code ?? "PROMO"} −${discountPct}%`
    : null;

  // "Lihat Detail" trigger button
  const detailTrigger = (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-xl border border-[#3A4A1F]/15 bg-white px-3 py-1.5 text-[11px] font-bold text-[#3A4A1F] transition-colors hover:bg-[#3A4A1F]/5 hover:border-[#3A4A1F]/30"
    >
      <Info className="h-3.5 w-3.5" />
      Lihat Detail Lengkap
    </button>
  );

  return (
    <article
      className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-200 hover:scale-[1.002]"
      aria-label={room.name}
    >
      <div className="flex flex-col lg:flex-row lg:min-h-[200px]">

        {/* ── Image ── */}
        <div className="relative aspect-[4/3] flex-shrink-0 overflow-hidden lg:aspect-auto lg:w-[280px] xl:w-[300px]">
          <ThumbGallery
            images={sortedImages}
            roomName={room.name}
            discountBadge={discountBadge}
          />
        </div>

        {/* ── Middle: Info ── */}
        <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6 lg:border-r lg:border-slate-100/80">

          {/* Title + bed */}
          <div>
            <h3 className="text-[18px] font-bold tracking-tight text-slate-900 sm:text-xl">
              {room.name}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-500">
              <BedDouble className="h-3.5 w-3.5 flex-shrink-0 text-[#3A4A1F]" />
              {room.bed_type?.trim() || "Bed setup by request"}
            </p>
          </div>

          {/* Highlight chips — admin-selected, max 4 */}
          {highlights.length > 0 ? (
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Unggulan
              </p>
              <div className="flex flex-wrap gap-1.5">
                {highlights.map((a, i) => (
                  <HighlightChip
                    key={(a as any).id ?? i}
                    name={a.name}
                    iconName={a.icon_name}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[12px] italic text-slate-400">
              Lihat detail untuk fasilitas lengkap
            </p>
          )}

          {/* Lihat Detail trigger → opens modal */}
          <div>
            <RoomDetailModal room={room} trigger={detailTrigger} />
          </div>
        </div>

        {/* ── Right: Price + CTA ── */}
        <div className="flex flex-col justify-between gap-4 bg-gradient-to-b from-slate-50/80 to-white p-5 sm:p-6 lg:w-[200px] lg:flex-shrink-0 xl:w-[220px]">

          {/* Pricing */}
          <div>
            {isComingSoon ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Harga
                </p>
                <p className="mt-1 text-sm font-bold text-slate-600">
                  Segera hadir
                </p>
              </>
            ) : (
              <>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Mulai dari
                </p>
                {hasPromo && (
                  <p className="mt-0.5 text-xs font-semibold text-slate-400 line-through">
                    {formatIDR(effectivePrice)}
                  </p>
                )}
                {hasManagedPrice ? (
                  <p className={`mt-0.5 text-[26px] font-black leading-tight tracking-tight ${
                    hasPromo ? "text-emerald-600" : "text-[#3A4A1F]"
                  }`}>
                    {formatIDR(finalPrice)}
                  </p>
                ) : (
                  <p className="mt-1 text-base font-bold text-slate-500">
                    Cek harga
                  </p>
                )}
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  {hasManagedPrice ? "/ malam" : "konfirmasi WhatsApp"}
                </p>

                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {room.price_source === "override" && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                      Harga hari ini
                    </span>
                  )}
                  {hasPromo && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-600">
                      Hemat {discountPct}%
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="space-y-1.5">
            {!isComingSoon && room.villaWhatsapp ? (
              <WhatsAppMessageForm
                whatsappNumber={room.villaWhatsapp}
                villaName={room.villaName}
                roomTypeName={room.name}
                buttonLabel="Pesan Sekarang"
                title={`Pesan ${room.name}`}
                buttonClassName="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-2.5 text-[12px] font-bold text-white shadow-sm transition-colors hover:bg-[#1ebe5d] active:scale-95"
              >
                <WaIcon />
                Pesan Sekarang
              </WhatsAppMessageForm>
            ) : (
              <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-2.5 text-xs font-medium text-slate-400">
                <MessageCircle className="h-3.5 w-3.5" />
                Segera Tersedia
              </div>
            )}
            <p className="text-center text-[10px] text-slate-400">
              {isComingSoon
                ? "Reservasi segera dibuka"
                : hasManagedPrice
                ? "* Harga dapat berubah"
                : "* Tanyakan via WhatsApp"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

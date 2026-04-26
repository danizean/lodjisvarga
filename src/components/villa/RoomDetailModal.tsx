"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Camera,
  Percent,
  Wind,
  Wifi,
  MonitorPlay,
  Refrigerator,
  ShowerHead,
  Waves,
} from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";
import type { RoomTypeCardData } from "@/components/features/villas/VillaCard";

// ─── Formatter ─────────────────────────────────────────────────────────────
const formatIDR = (v: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v);

// ─── WhatsApp SVG ───────────────────────────────────────────────────────────
const WaIcon = () => (
  <svg className="h-4 w-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
  </svg>
);

// ─── Default amenities — shown when room has no amenity data ───────────────
const DEFAULT_AMENITIES = [
  { id: "_d1", name: "AC", icon_name: "wind" },
  { id: "_d2", name: "WiFi", icon_name: "wifi" },
  { id: "_d3", name: "Google TV", icon_name: "monitor-play" },
  { id: "_d4", name: "Kulkas", icon_name: "refrigerator" },
  { id: "_d5", name: "Water Heater", icon_name: "shower-head" },
  { id: "_d6", name: "Kolam Renang", icon_name: "waves" },
];

// ─── Amenity type ────────────────────────────────────────────────────────────
type AmenityItem = {
  id?: string;
  name: string;
  icon_name?: string | null;
};

// ─── Modal Gallery Slider ───────────────────────────────────────────────────
function ModalGallery({
  images,
  roomName,
}: {
  images: string[];
  roomName: string;
}) {
  const [idx, setIdx] = useState(0);
  const list = images.length > 0 ? images : ["/assets/placeholder-villa.webp"];

  const prev = useCallback(
    () => setIdx((i) => (i === 0 ? list.length - 1 : i - 1)),
    [list.length]
  );
  const next = useCallback(
    () => setIdx((i) => (i === list.length - 1 ? 0 : i + 1)),
    [list.length]
  );

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 sm:aspect-[21/9]">
      <Image
        src={list[idx]}
        alt={`${roomName} – foto ${idx + 1}`}
        fill
        className="object-cover transition-opacity duration-500"
        sizes="(max-width: 768px) 100vw, 80vw"
        priority
      />
      {/* bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

      {list.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Foto sebelumnya"
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Foto berikutnya"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          {/* dot indicators */}
          <div className="absolute bottom-3.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 pointer-events-none">
            {list.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === idx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* photo counter */}
      <div className="absolute bottom-3.5 right-3.5 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <Camera className="h-3.5 w-3.5" />
        {idx + 1} / {list.length}
      </div>
    </div>
  );
}

// ─── Single Amenity Chip in Modal ───────────────────────────────────────────
function AmenityChip({ amenity }: { amenity: AmenityItem }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 transition-colors hover:border-[#3A4A1F]/20 hover:bg-[#3A4A1F]/5">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#3A4A1F]/8">
        <LucideDynamicIcon
          iconName={amenity.icon_name}
          amenityName={amenity.name}
          className="h-4 w-4 text-[#3A4A1F]"
        />
      </span>
      <span className="text-[12px] font-semibold leading-snug text-slate-700">
        {amenity.name}
      </span>
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────
interface Props {
  room: RoomTypeCardData;
  trigger: React.ReactNode;
}

export function RoomDetailModal({ room, trigger }: Props) {
  const effectivePrice = room.effective_price ?? 0;
  const discountPct = room.activePromo?.discount_value ?? 0;
  const hasPromo = discountPct > 0 && effectivePrice > 0;
  const hasManagedPrice = effectivePrice > 0;
  const isComingSoon = room.villaStatus === "coming_soon";
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(effectivePrice * (1 - discountPct / 100)))
    : effectivePrice;

  // ── Gallery ──────────────────────────────────────────────────────────────
  const sortedImages = [...(room.gallery ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .map((img) => img.image_url)
    .filter(Boolean);

  // ── Amenities — use DB data if available, else show defaults ─────────────
  const rawAmenities = (room.amenities ?? []) as AmenityItem[];
  const amenities: AmenityItem[] =
    rawAmenities.length > 0 ? rawAmenities : DEFAULT_AMENITIES;

  const description =
    room.description?.trim() ||
    "Unit premium yang dirancang untuk kenyamanan maksimal selama menginap Anda di Lodjisvarga.";

  const isUsingFallback = rawAmenities.length === 0;

  return (
    <DialogPrimitive.Root>
      {/* ── Trigger ── */}
      <DialogPrimitive.Trigger render={trigger as React.ReactElement} />

      <DialogPrimitive.Portal>
        {/* ── Backdrop ── */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200" />

        {/* ── Panel ── */}
        <DialogPrimitive.Popup
          className={[
            "fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl outline-none",
            // mobile: full-height bottom sheet
            "inset-x-0 bottom-0 max-h-[94dvh] rounded-t-[28px]",
            // desktop: centered modal
            "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
            "sm:w-[740px] sm:max-w-[94vw] sm:max-h-[90dvh] sm:rounded-[28px]",
            // animations
            "data-open:animate-in data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0",
            "data-open:slide-in-from-bottom-[48%] data-closed:slide-out-to-bottom-[48%]",
            "sm:data-open:zoom-in-95 sm:data-closed:zoom-out-95",
            "sm:data-open:slide-in-from-top-[48%] sm:data-closed:slide-out-to-top-[48%]",
            "duration-200",
          ].join(" ")}
        >
          {/* Mobile drag handle */}
          <div className="flex justify-center pb-1 pt-3 sm:hidden">
            <div className="h-1 w-10 rounded-full bg-slate-300" />
          </div>

          {/* Close button — always on top of image */}
          <DialogPrimitive.Close
            className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>

          {/* ════════════════════════════════════════════════════════════
              SCROLLABLE BODY
              ════════════════════════════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto overscroll-contain">

            {/* Gallery */}
            <ModalGallery images={sortedImages} roomName={room.name} />

            <div className="px-5 pb-6 pt-5 sm:px-7 sm:pt-6">

              {/* ── Header ── */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <DialogPrimitive.Title className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    {room.name}
                  </DialogPrimitive.Title>
                  <p className="mt-0.5 text-sm font-semibold text-[#3A4A1F]">
                    {room.villaName}
                  </p>
                </div>
                {hasPromo && (
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                    <Percent className="h-3 w-3" />
                    {room.activePromo?.discount_code} −{discountPct}%
                  </span>
                )}
              </div>

              {/* ── Key Specs Bento Row ── */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {/* Bed type */}
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#3A4A1F]/8">
                    <BedDouble className="h-4.5 w-4.5 text-[#3A4A1F]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Tipe Kasur
                    </p>
                    <p className="mt-0.5 truncate text-[13px] font-bold text-slate-800">
                      {room.bed_type?.trim() || "By Request"}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 sm:col-span-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Harga / malam
                    </p>
                    {hasManagedPrice ? (
                      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                        <p
                          className={`text-lg font-black leading-none ${
                            hasPromo ? "text-emerald-600" : "text-[#3A4A1F]"
                          }`}
                        >
                          {formatIDR(finalPrice)}
                        </p>
                        {hasPromo && (
                          <p className="text-[12px] font-semibold text-slate-400 line-through">
                            {formatIDR(effectivePrice)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-0.5 text-sm font-bold text-slate-500">
                        Konfirmasi via WhatsApp
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Full description ── */}
              <div className="mt-6">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Tentang Kamar
                </p>
                <DialogPrimitive.Description className="text-sm leading-[1.85] text-slate-600">
                  {description}
                </DialogPrimitive.Description>
              </div>

              {/* ── Amenity grid ── */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Fasilitas Kamar
                    {!isUsingFallback && (
                      <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                        {amenities.length}
                      </span>
                    )}
                  </p>
                  {isUsingFallback && (
                    <span className="text-[10px] text-slate-400 italic">
                      Fasilitas standar
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {amenities.map((amenity, i) => (
                    <AmenityChip key={amenity.id ?? i} amenity={amenity} />
                  ))}
                </div>
              </div>

              {/* bottom spacer so sticky footer clears content */}
              <div className="h-4" />
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════
              STICKY BOOKING FOOTER
              ════════════════════════════════════════════════════════════ */}
          <div className="flex-shrink-0 border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-7">
            <div className="flex items-center justify-between gap-4">
              {/* Price summary */}
              <div className="min-w-0">
                {isComingSoon ? (
                  <p className="text-sm font-semibold text-slate-500">
                    Segera hadir
                  </p>
                ) : hasManagedPrice ? (
                  <>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                      Mulai dari
                    </p>
                    <p
                      className={`text-xl font-black leading-tight ${
                        hasPromo ? "text-emerald-600" : "text-[#3A4A1F]"
                      }`}
                    >
                      {formatIDR(finalPrice)}
                      <span className="ml-1 text-xs font-normal text-slate-400">
                        /malam
                      </span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-slate-500">
                    Tanyakan harga via WhatsApp
                  </p>
                )}
              </div>

              {/* CTA button */}
              {!isComingSoon && room.villaWhatsapp ? (
                <WhatsAppMessageForm
                  whatsappNumber={room.villaWhatsapp}
                  villaName={room.villaName}
                  roomTypeName={room.name}
                  buttonLabel="Pesan Sekarang"
                  title={`Pesan ${room.name}`}
                  buttonClassName="flex flex-shrink-0 items-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1ebe5d] active:scale-95 sm:px-7"
                >
                  <WaIcon />
                  Pesan Sekarang
                </WhatsAppMessageForm>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-5 py-3 text-sm font-medium text-slate-400">
                  Segera Tersedia
                </div>
              )}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

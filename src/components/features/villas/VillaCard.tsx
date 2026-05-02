"use client";

import Link from "next/link";
import { ArrowRight, BedDouble, Clock, Tag } from "lucide-react";
import { PriceBlock } from "@/components/features/villas/primitives/PriceBlock";
import { AmenityChipGroup } from "@/components/features/villas/primitives/AmenityChipGroup";
import { RoomImageCarousel } from "@/components/features/villas/primitives/RoomImageCarousel";
import { InquiryCTA } from "@/components/features/villas/primitives/InquiryCTA";
import type { RoomTypeCardData } from "@/types/public-villas";

const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const WhatsAppIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
  </svg>
);

export function VillaCard({ room }: { room: RoomTypeCardData }) {
  const isComingSoon = room.villaStatus === "coming_soon";
  const isActiveVilla = room.villaStatus === "active";

  const allAmenities = room.amenities ?? [];
  const highlightAmenities = (room.highlight_amenities ?? []).slice(0, 3);
  const displayAmenities =
    highlightAmenities.length > 0
      ? highlightAmenities
      : allAmenities.filter((amenity) => amenity.name);

  const legacyPoolBadge =
    displayAmenities.length === 0 &&
    allAmenities.some((amenity) => amenity.name.toLowerCase().includes("pool"));

  const roomImages = [...(room.gallery ?? [])]
    .sort((left, right) => {
      if (left.is_primary && !right.is_primary) return -1;
      if (!left.is_primary && right.is_primary) return 1;
      return (left.display_order ?? 0) - (right.display_order ?? 0);
    })
    .map((gallery) => gallery.image_url)
    .filter(Boolean);

  return (
    <PriceBlock room={room}>
      {(pricing) => (
        <div className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200">
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
            <RoomImageCarousel
              images={roomImages}
              roomName={room.name}
              rootClassName="h-full"
              imageClassName="group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              bottomOverlayClassName="h-24 bg-gradient-to-t from-black/40 to-transparent"
              leftNavClassName="opacity-0 group-hover:opacity-100"
              rightNavClassName="opacity-0 group-hover:opacity-100"
              topBadge={
                pricing.hasPromo && !isComingSoon ? (
                  <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                    <Tag className="h-3 w-3" />
                    {room.activePromo?.discount_code} -{pricing.discountPercentage}%
                  </div>
                ) : null
              }
            />

            {isComingSoon ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2.5 bg-black/55 backdrop-blur-sm">
                <Clock className="h-7 w-7 text-white/70" />
                <span className="rounded-full border border-white/50 px-5 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-white">
                  Segera Hadir
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]">
              {room.villaName}
            </p>

            <h3 className="text-lg font-black tracking-tight text-slate-900 line-clamp-1">
              {room.name}
            </h3>

            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-slate-500">
              <BedDouble className="h-3.5 w-3.5 flex-shrink-0 text-[#3A4A1F]" />
              {room.bed_type?.trim() || "Bed setup by request"}
            </p>

            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {room.description ?? `Nikmati kenyamanan eksklusif di ${room.villaName}.`}
            </p>

            <div className="mt-3.5">
              <AmenityChipGroup
                amenities={displayAmenities}
                maxVisible={4}
                legacyPoolBadge={legacyPoolBadge}
              />
            </div>

            <div className="flex-1" />

            <div className="mt-5 border-t border-slate-100 pt-5">
              {isComingSoon ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-sm font-medium text-slate-500">Harga akan segera diumumkan</p>
                    <p className="mt-0.5 text-xs text-slate-400">Daftarkan minat Anda via WhatsApp</p>
                  </div>

                  <InquiryCTA
                    isBookable={room.villaStatus !== "inactive"}
                    whatsappNumber={room.villaWhatsapp}
                    villaName={room.villaName}
                    roomTypeName={room.name}
                    buttonLabel="Hubungi Kami"
                    title={`Chat ${room.villaName}`}
                    buttonClassName="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-sm font-bold text-white transition-colors hover:bg-[#128C7E]"
                    fallback={
                      <div className="flex w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-slate-400">
                        Segera Tersedia
                      </div>
                    }
                  >
                    <WhatsAppIcon />
                    Hubungi Kami
                  </InquiryCTA>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Mulai dari
                      </p>
                      {pricing.hasPromo ? (
                        <p className="mt-0.5 text-xs font-semibold text-slate-400 line-through">
                          {formatIDR(pricing.displayPrice)}
                        </p>
                      ) : null}

                      {pricing.hasManagedPrice ? (
                        <p
                          className={`text-[22px] font-black leading-tight ${
                            pricing.hasPromo ? "text-emerald-600" : "text-[#3A4A1F]"
                          }`}
                        >
                          {formatIDR(pricing.finalPrice)}
                          <span className="ml-1 text-sm font-normal text-slate-400">/malam</span>
                        </p>
                      ) : (
                        <p className="text-base font-bold text-slate-500">Hubungi kami</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {pricing.priceSource === "override" ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                          Harga hari ini
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <InquiryCTA
                      isBookable={isActiveVilla}
                      whatsappNumber={room.villaWhatsapp}
                      villaName={room.villaName}
                      roomTypeName={room.name}
                      buttonLabel="WhatsApp"
                      title={`Pesan ${room.name}`}
                      buttonClassName="flex items-center justify-center gap-1.5 rounded-2xl bg-[#25D366] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#128C7E]"
                      fallback={
                        <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-300 py-2.5 text-xs font-semibold text-slate-400">
                          Tidak Tersedia
                        </div>
                      }
                    >
                      <WhatsAppIcon />
                      WhatsApp
                    </InquiryCTA>

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
      )}
    </PriceBlock>
  );
}


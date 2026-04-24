import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BedDouble, MessageCircle, ArrowUpRight } from "lucide-react";
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

export function VillaUnitCard({ room }: VillaUnitCardProps) {
  const isComingSoon = room.villaStatus === "coming_soon";
  const effectivePrice = room.effective_price ?? 0;
  const discountPercentage = room.activePromo?.discount_value ?? 0;
  const hasPromo = discountPercentage > 0 && effectivePrice > 0;
  const hasManagedPrice = effectivePrice > 0;
  const finalPrice = hasPromo
    ? Math.max(0, Math.round(effectivePrice * (1 - discountPercentage / 100)))
    : effectivePrice;

  // Primary image
  const primaryImage = [...(room.gallery ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })[0]?.image_url ?? null;

  // Resolved highlights from the server (max 3)
  const highlightAmenities = (room.highlight_amenities ?? []).slice(0, 3);

  // Legacy fallback: show Private Pool badge if no highlights are configured yet
  const legacyPoolBadge =
    highlightAmenities.length === 0 &&
    (room.amenities ?? []).some((a) =>
      a.name?.toLowerCase().includes("pool")
    );

  const priceText = hasManagedPrice ? formatIDR(finalPrice) : "Cek harga";
  const originalPriceText = hasPromo ? formatIDR(effectivePrice) : null;
  const promoText = hasPromo ? `${room.activePromo?.discount_code} -${discountPercentage}%` : null;
  const badgeText = room.price_source === "override" ? "Harga hari ini" : null;

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row">
        {/* Image */}
        <div className="relative h-56 overflow-hidden rounded-2xl bg-slate-100 lg:w-64 lg:flex-shrink-0">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={room.name}
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 256px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BedDouble className="h-8 w-8 text-slate-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1 mr-4">
              <h3 className="text-xl font-black text-slate-950">{room.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-2">
                {room.description ?? "Unit premium yang dirancang untuk kenyamanan maksimal."}
              </p>
            </div>

            {/* Price Box */}
            <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:min-w-[170px] sm:text-right border border-slate-100 shrink-0">
              {originalPriceText && (
                <p className="text-xs font-semibold text-slate-400 line-through">{originalPriceText}</p>
              )}
              <p className="text-2xl font-black text-[#3A4A1F]">{priceText}</p>
              <p className="mt-1 text-xs text-slate-400">
                {hasManagedPrice ? "per malam" : "konfirmasi via WhatsApp"}
              </p>
            </div>
          </div>

          {/* ── USP Row ── */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Bed Type */}
            <Badge variant="outline" className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-700 border-slate-200">
              <BedDouble className="h-3.5 w-3.5 mr-1.5 text-[#3A4A1F]" />
              {room.bed_type?.trim() || "Bed setup by request"}
            </Badge>

            {/* Highlighted Amenities */}
            {highlightAmenities.map((amenity) => (
              <Badge
                key={amenity.id}
                variant="outline"
                className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-slate-700 border-slate-200"
              >
                <LucideDynamicIcon
                  iconName={amenity.icon_name}
                  className="h-3.5 w-3.5 mr-1.5 text-[#3A4A1F]"
                />
                {amenity.name}
              </Badge>
            ))}

            {/* Legacy Pool Badge */}
            {legacyPoolBadge && (
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-emerald-900 border-emerald-200 bg-emerald-50">
                <LucideDynamicIcon iconName="waves" className="h-3.5 w-3.5 mr-1.5" />
                Private Pool
              </Badge>
            )}

            {badgeText && (
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-emerald-700 border-emerald-200 bg-emerald-50/50">
                {badgeText}
              </Badge>
            )}
            {promoText && (
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-amber-700 border-amber-200 bg-amber-50">
                {promoText}
              </Badge>
            )}
          </div>

          {/* WhatsApp Action */}
          <div className="mt-5 sm:mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {!hasManagedPrice ? "*Harga belum diatur untuk tanggal yang dipilih" : "*Harga dapat berubah sewaktu-waktu"}
            </span>

            {!isComingSoon && room.villaWhatsapp ? (
              <WhatsAppMessageForm
                whatsappNumber={room.villaWhatsapp}
                villaName={room.villaName}
                roomTypeName={room.name}
                buttonLabel="Pesan Sekarang"
                title={`Pesan ${room.name}`}
                buttonClassName="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#128C7E]"
              >
                <MessageCircle className="h-4 w-4" />
                Pesan Sekarang
              </WhatsAppMessageForm>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500 font-medium">
                Reservasi belum dibuka
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

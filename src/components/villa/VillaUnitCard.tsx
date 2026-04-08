import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BedDouble, MessageCircle, Users } from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";

interface VillaUnitCardProps {
  villaName: string;
  whatsappNumber?: string | null;
  roomTypeOptions: string[];
  name: string;
  description: string;
  imageUrl: string | null;
  guestText: string;
  photoCount: number;
  priceText: string;
  originalPriceText?: string | null;
  promoText?: string | null;
  badgeText?: string | null;
  isComingSoon: boolean;
}

export function VillaUnitCard({
  villaName,
  whatsappNumber,
  roomTypeOptions,
  name,
  description,
  imageUrl,
  guestText,
  photoCount,
  priceText,
  originalPriceText,
  promoText,
  badgeText,
  isComingSoon,
}: VillaUnitCardProps) {
  const hasManagedPrice = priceText !== "Cek harga";

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row">
        <div className="relative h-56 overflow-hidden rounded-2xl bg-slate-100 lg:w-56 lg:flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 224px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BedDouble className="h-8 w-8 text-slate-300" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-xl font-black text-slate-950">{name}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>

                              <div className="rounded-2xl bg-slate-50 px-4 py-3 sm:min-w-[170px] sm:text-right">
                                {originalPriceText && (
                                  <p className="text-xs font-semibold text-slate-400 line-through">{originalPriceText}</p>
                                )}
                                <p className="text-2xl font-black text-[#3A4A1F]">{priceText}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {hasManagedPrice ? "per malam" : "konfirmasi via WhatsApp"}
                                </p>
                              </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700">
              <Users className="h-3 w-3" />
              {guestText}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700">
              <BedDouble className="h-3 w-3" />
              {photoCount} foto unit
            </Badge>
            {badgeText && (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-emerald-700">
                {badgeText}
              </Badge>
            )}
            {promoText && (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-amber-700">
                {promoText}
              </Badge>
            )}
          </div>

          <div className="mt-5">
            {!isComingSoon && whatsappNumber ? (
              <WhatsAppMessageForm
                whatsappNumber={whatsappNumber}
                villaName={villaName}
                roomTypeName={name}
                roomTypeOptions={roomTypeOptions}
                buttonLabel="Select Unit"
                title={`Reservasi ${name}`}
                buttonClassName="h-11 rounded-2xl bg-[#25D366] px-5 text-sm font-bold text-white hover:bg-[#128C7E]"
              >
                <span className="inline-flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Select Unit
                </span>
              </WhatsAppMessageForm>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Unit akan bisa dibooking setelah properti aktif.
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

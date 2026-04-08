import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";

interface VillaBookingCardProps {
  villaName: string;
  whatsappNumber?: string | null;
  roomTypeOptions: string[];
  startingPriceText: string;
  guestSummary: string;
  roomCount: number;
  isComingSoon: boolean;
}

export function VillaBookingCard({
  villaName,
  whatsappNumber,
  roomTypeOptions,
  startingPriceText,
  guestSummary,
  roomCount,
  isComingSoon,
}: VillaBookingCardProps) {
  const hasManagedPrice = startingPriceText !== "Cek harga";

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm" id="booking-card">
      <div className="space-y-5 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Mulai dari</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-black text-[#3A4A1F]">{startingPriceText}</span>
            {hasManagedPrice && <span className="pb-1 text-xs text-slate-400">/ malam</span>}
          </div>
        </div>

        {!isComingSoon && whatsappNumber ? (
          <WhatsAppMessageForm
            whatsappNumber={whatsappNumber}
            villaName={villaName}
            roomTypeOptions={roomTypeOptions}
            buttonLabel="Book Now"
            title={`Reservasi ${villaName}`}
            buttonClassName="h-12 w-full rounded-2xl bg-[#25D366] text-sm font-bold shadow-sm hover:bg-[#128C7E]"
          >
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Book Now
            </span>
          </WhatsAppMessageForm>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            Reservasi akan dibuka setelah properti aktif dipublikasikan.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700">
            {guestSummary}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700">
            {roomCount} unit
          </Badge>
        </div>
      </div>
    </section>
  );
}

interface VillaMobileBookingBarProps {
  villaName: string;
  whatsappNumber?: string | null;
  roomTypeOptions: string[];
  startingPriceText: string;
  isComingSoon: boolean;
}

export function VillaMobileBookingBar({
  villaName,
  whatsappNumber,
  roomTypeOptions,
  startingPriceText,
  isComingSoon,
}: VillaMobileBookingBarProps) {
  if (isComingSoon || !whatsappNumber) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Start from</p>
          <p className="truncate text-base font-black text-[#3A4A1F]">{startingPriceText}</p>
        </div>
        <WhatsAppMessageForm
          whatsappNumber={whatsappNumber}
          villaName={villaName}
          roomTypeOptions={roomTypeOptions}
          buttonLabel="Book Now"
          title={`Reservasi ${villaName}`}
          buttonClassName="h-11 rounded-2xl bg-[#25D366] px-5 text-sm font-bold text-white hover:bg-[#128C7E]"
        >
          Book Now
        </WhatsAppMessageForm>
      </div>
    </div>
  );
}

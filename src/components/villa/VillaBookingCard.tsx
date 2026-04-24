import { MessageCircle, ShieldCheck, Users } from "lucide-react";
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
    <section
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      id="booking-card"
      aria-label="Booking card"
    >
      {/* Price header */}
      <div className="bg-gradient-to-br from-[#3A4A1F] to-[#2F3B19] px-6 py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          Harga mulai dari
        </p>
        <div className="mt-1.5 flex items-end gap-2">
          <span className="text-4xl font-black text-white">{startingPriceText}</span>
          {hasManagedPrice && (
            <span className="mb-1.5 text-sm font-medium text-white/60">/ malam</span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
            <Users className="h-3 w-3" />
            {guestSummary}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80">
            {roomCount} unit tersedia
          </span>
        </div>
      </div>

      {/* CTA body */}
      <div className="space-y-4 p-5">
        {!isComingSoon && whatsappNumber ? (
          <>
            <WhatsAppMessageForm
              whatsappNumber={whatsappNumber}
              villaName={villaName}
              roomTypeOptions={roomTypeOptions}
              buttonLabel="Book via WhatsApp"
              title={`Reservasi ${villaName}`}
              buttonClassName="h-13 w-full rounded-2xl bg-[#25D366] text-sm font-bold shadow-md shadow-green-200 transition-colors hover:bg-[#1ebe5d]"
            >
              <span className="inline-flex items-center gap-2.5">
                <MessageCircle className="h-4 w-4" />
                Book via WhatsApp
              </span>
            </WhatsAppMessageForm>

            <a
              href="#units"
              className="flex h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Lihat semua unit
            </a>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            Reservasi akan dibuka setelah properti aktif dipublikasikan.
          </div>
        )}

        {/* Trust signal */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 px-4 py-3">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <p className="text-xs leading-5 text-emerald-800">
            Konfirmasi langsung via WhatsApp. Tidak ada biaya tersembunyi.
          </p>
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Mulai dari
          </p>
          <p className="truncate text-lg font-black text-[#3A4A1F]">{startingPriceText}</p>
        </div>
        <WhatsAppMessageForm
          whatsappNumber={whatsappNumber}
          villaName={villaName}
          roomTypeOptions={roomTypeOptions}
          buttonLabel="Book Now"
          title={`Reservasi ${villaName}`}
          buttonClassName="h-12 rounded-2xl bg-[#25D366] px-6 text-sm font-bold text-white shadow-md shadow-green-200 transition-colors hover:bg-[#1ebe5d] shrink-0"
        >
          <span className="inline-flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Book Now
          </span>
        </WhatsAppMessageForm>
      </div>
    </div>
  );
}

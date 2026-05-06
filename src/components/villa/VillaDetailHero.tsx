import Image from "next/image";
import { Camera, MapPin, Sparkles, Users } from "lucide-react";

type GalleryItem = {
  url: string;
  label: string;
};

interface VillaDetailHeroProps {
  name: string;
  address: string | null;
  summary: string;
  heroPhoto: string | null;
  galleryPreview: GalleryItem[];
  isComingSoon: boolean;
  startingPriceText: string;
  guestSummary: string;
  totalPhotos: number;
  whatsappNumber?: string | null;
}

const WaIconSmall = () => (
  <svg className="h-3.5 w-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
  </svg>
);

export function VillaDetailHero({
  name,
  address,
  summary,
  heroPhoto,
  isComingSoon,
  startingPriceText,
  guestSummary,
  totalPhotos,
  whatsappNumber,
}: VillaDetailHeroProps) {
  const hasPrice = startingPriceText !== "Cek harga";
  const priceLabel = hasPrice ? `Mulai ${startingPriceText} / malam` : "Tanyakan harga";

  const waUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Halo Lodjisvarga, saya ingin menanyakan ketersediaan kamar. Reff: Villa Detail"
      )}`
    : null;

  return (
    <section
      className="relative min-h-[65vh] w-full overflow-hidden bg-slate-900 md:min-h-[72vh]"
      aria-label={`${name} hero`}
    >
      {/* Background photo */}
      {heroPhoto ? (
        <Image
          src={heroPhoto}
          alt={name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#3A4A1F] to-[#0f1a09]" />
      )}

      {/* Gradient overlays — deeper at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-transparent to-transparent" />

      {/* Coming soon badge */}
      {isComingSoon && (
        <div className="absolute right-4 top-20 z-10 sm:right-6 lg:right-8">
          <span className="inline-flex items-center rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            Coming Soon
          </span>
        </div>
      )}

      {/* Hero content — anchored to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl space-y-4">
            {/* Villa name */}
            <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {name}
            </h1>

            {/* Address */}
            {address && (
              <p className="flex items-center gap-2 text-sm font-medium text-white/65">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                {address}
              </p>
            )}

            {/* Summary — clamped to 2 lines on mobile */}
            <p className="max-w-xl text-sm leading-7 text-white/65 line-clamp-2 sm:line-clamp-none sm:text-[15px]">
              {summary}
            </p>

            {/* ── Stats row ── */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Price pill — gold accent, slightly more prominent */}
              <div className="flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/12 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                {priceLabel}
              </div>

              {/* Guests pill */}
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {guestSummary}
              </div>

              {/* Photo count pill */}
              {totalPhotos > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
                  <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                  {totalPhotos} foto
                </div>
              )}
            </div>

            {/* ── CTA row — hierarchy: primary = units, secondary = WA ── */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Primary: scroll to units */}
              <a
                href="#units"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#3A4A1F] shadow-lg transition-all hover:bg-white/90 active:scale-95"
              >
                Lihat Unit & Harga
              </a>

              {/* Secondary: WhatsApp — lower visual weight */}
              {waUrl && !isComingSoon && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
                >
                  <WaIconSmall />
                  Tanya via WhatsApp
                </a>
              )}

              {/* Gallery shortcut */}
              <a
                href="#gallery"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-5 py-2.5 text-sm font-medium text-white/70 transition-all hover:text-white hover:border-white/30 active:scale-95"
              >
                Galeri
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

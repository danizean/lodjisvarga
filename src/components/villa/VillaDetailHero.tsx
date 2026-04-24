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
}

export function VillaDetailHero({
  name,
  address,
  summary,
  heroPhoto,
  isComingSoon,
  startingPriceText,
  guestSummary,
  totalPhotos,
}: VillaDetailHeroProps) {
  const priceLabel =
    startingPriceText === "Cek harga"
      ? "Cek harga via WhatsApp"
      : `Mulai ${startingPriceText} / malam`;

  return (
    <section
      className="relative min-h-[70vh] w-full overflow-hidden bg-slate-900 md:min-h-[75vh]"
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

      {/* Multi-layer gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />

      {/* Badges */}
      <div className="absolute right-4 top-20 z-10 flex flex-col gap-2 sm:right-6 lg:right-8">
        {isComingSoon && (
          <span className="inline-flex items-center rounded-full bg-amber-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            Coming Soon
          </span>
        )}
      </div>

      {/* Hero content — pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            {/* Villa name */}
            <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {name}
            </h1>

            {/* Address */}
            {address && (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-white/75">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                {address}
              </p>
            )}

            {/* Summary */}
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-[15px]">
              {summary}
            </p>

            {/* Quick stats strip */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {priceLabel}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" />
                {guestSummary}
              </div>
              {totalPhotos > 0 && (
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  <Camera className="h-3.5 w-3.5" />
                  {totalPhotos} foto
                </div>
              )}

              {/* CTA anchors */}
              <a
                href="#units"
                className="inline-flex items-center gap-2 rounded-full bg-[#3A4A1F] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#2F3B19]"
              >
                Lihat Unit
              </a>
              <a
                href="#gallery"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Lihat Galeri
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

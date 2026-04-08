import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
  galleryPreview,
  isComingSoon,
  startingPriceText,
  guestSummary,
  totalPhotos,
}: VillaDetailHeroProps) {
  const previewPhotos = galleryPreview.slice(0, 4);
  const priceLabel =
    startingPriceText === "Cek harga" ? "Cek harga via WhatsApp" : `Mulai ${startingPriceText}`;

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="relative min-h-[320px] bg-slate-100">
          {heroPhoto ? (
            <Image
              src={heroPhoto}
              alt={name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#3A4A1F] to-[#1A2510]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

          <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
            {isComingSoon && (
              <Badge className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                Coming Soon
              </Badge>
            )}
            <Badge className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900">
              Villa Detail
            </Badge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <div className="max-w-2xl">
              <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">{name}</h1>
              {address && (
                <p className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {address}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="hidden gap-2 border-l border-slate-200 bg-slate-50 p-3 lg:grid">
          {previewPhotos.length > 0 ? (
            <>
              {previewPhotos.slice(0, 3).map((photo, index) => (
                <div key={`${photo.url}-${index}`} className="relative min-h-[96px] overflow-hidden rounded-2xl">
                  <Image
                    src={photo.url}
                    alt={photo.label}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              ))}
              <div className="rounded-2xl bg-white p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Quick Snapshot</p>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Sparkles className="h-4 w-4 text-[#3A4A1F]" />
                    <span>{priceLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Users className="h-4 w-4 text-[#3A4A1F]" />
                    <span>{guestSummary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Camera className="h-4 w-4 text-[#3A4A1F]" />
                    <span>{totalPhotos} foto siap dilihat</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-[22px] bg-white text-sm font-medium text-slate-500">
              Foto villa akan tampil di sini
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700">
            {priceLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700">
            {guestSummary}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700">
            {totalPhotos} foto
          </Badge>
        </div>

        <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
          {summary}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#booking-card"
            className="inline-flex items-center justify-center rounded-2xl bg-[#3A4A1F] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#2F3B19]"
          >
            Book Now
          </a>
          <a
            href="#gallery"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            View Gallery
          </a>
        </div>
      </div>
    </section>
  );
}

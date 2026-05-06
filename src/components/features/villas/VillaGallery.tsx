"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Grid2X2, Home, ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type VillaGalleryItem = {
  url: string;
  label: string;
  category: "villa" | "unit";
};

interface VillaGalleryProps {
  items: VillaGalleryItem[];
  title?: string;
  description?: string;
}

export function VillaGallery({
  items,
  title = "Foto Villa & Unit",
  description = "",
}: VillaGalleryProps) {
  const galleryItems = useMemo(
    () =>
      items.filter((item, index, array) => {
        if (!item.url) return false;
        return (
          array.findIndex(
            (candidate) =>
              candidate.url === item.url &&
              candidate.label === item.label &&
              candidate.category === item.category
          ) === index
        );
      }),
    [items]
  );

  const [activeFilter, setActiveFilter] = useState<"all" | "villa" | "unit">("all");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (galleryItems.length === 0) return null;

  const villaCount = galleryItems.filter((item) => item.category === "villa").length;
  const unitCount = galleryItems.filter((item) => item.category === "unit").length;
  const filteredItems =
    activeFilter === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeFilter);
  const previewItems = filteredItems.slice(0, 5);
  const safeIndex = Math.min(activeIndex, Math.max(filteredItems.length - 1, 0));
  const activeItem = filteredItems[safeIndex] ?? filteredItems[0];

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const goPrev = () => {
    setActiveIndex((current) => (current === 0 ? filteredItems.length - 1 : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current === filteredItems.length - 1 ? 0 : current + 1));
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const delta = touchStartX - touchEndX;

    if (Math.abs(delta) > 40) {
      if (delta > 0) goNext();
      else goPrev();
    }

    setTouchStartX(null);
  };

  const filterTabs = [
    { key: "all" as const, label: "Semua Foto", count: galleryItems.length, icon: Grid2X2 },
    { key: "villa" as const, label: "Foto Villa", count: villaCount, icon: Home },
    { key: "unit" as const, label: "Foto Unit", count: unitCount, icon: ImageIcon },
  ];

  return (
    <section id="gallery" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Gallery</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {filterTabs
            .filter((tab) => tab.count > 0)
            .map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.key);
                    setActiveIndex(0);
                  }}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#3A4A1F] text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-12 md:grid-rows-2">
        {previewItems.map((item, index) => {
          const isPrimary = index === 0;

          return (
            <button
              key={`${item.url}-${index}`}
              type="button"
              onClick={() => openLightbox(index)}
              className={
                isPrimary
                  ? "group relative aspect-[4/3] overflow-hidden rounded-2xl md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[430px]"
                  : "group relative aspect-[4/3] overflow-hidden rounded-2xl md:col-span-5"
              }
            >
              <Image
                src={item.url}
                alt={item.label}
                fill
                priority={isPrimary}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={isPrimary ? "(max-width: 768px) 100vw, 58vw" : "(max-width: 768px) 50vw, 28vw"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">
                    {item.category === "villa" ? "Villa" : "Unit"}
                  </Badge>
                  <Badge className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">
                    {item.label}
                  </Badge>
                </div>
                {index === previewItems.length - 1 && filteredItems.length > previewItems.length && (
                  <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    +{filteredItems.length - previewItems.length} foto
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>


      {/* View all link */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3A4A1F]/60 transition-colors hover:text-[#3A4A1F] focus-visible:outline-none"
        >
          <Camera className="h-3.5 w-3.5" />
          Lihat Semua Foto
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] gap-3 border-0 bg-slate-950 p-3 text-white shadow-2xl sm:max-w-5xl sm:p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Photo Viewer</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">
                  {activeItem.category === "villa" ? "Villa" : "Unit"}
                </span>
                <p className="text-sm font-semibold text-white">{activeItem.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                {safeIndex + 1} / {filteredItems.length}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close gallery"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl bg-black"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative aspect-[4/3] w-full min-h-[320px] sm:min-h-[520px]">
              <Image
                src={activeItem.url}
                alt={activeItem.label}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {filteredItems.length > 1 && (
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2">
                {filteredItems.map((item, index) => (
                  <button
                    key={`${item.url}-thumb-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl border transition-all ${
                      index === activeIndex
                        ? "border-white shadow-[0_0_0_1px_rgba(255,255,255,0.7)]"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={item.url}
                      alt={item.label}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

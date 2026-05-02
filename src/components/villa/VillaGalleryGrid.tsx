import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type GalleryItem = {
  url: string;
  label: string;
};

interface VillaGalleryGridProps {
  items: GalleryItem[];
}

export function VillaGalleryGrid({ items }: VillaGalleryGridProps) {
  const galleryItems = items.slice(0, 6);

  if (galleryItems.length === 0) return null;

  return (
    <section id="gallery" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Gallery</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Lihat villa dan unit dengan cepat</h2>
        </div>
        <p className="hidden text-sm text-slate-500 md:block">Foto area villa dan unit kamar digabung agar lebih mudah dipindai.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 md:grid-rows-2">
        {galleryItems.map((item, index) => (
          <div
            key={`${item.url}-${index}`}
            className={index === 0 ? "relative aspect-[4/3] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto md:min-h-[420px]" : "relative aspect-[4/3] overflow-hidden rounded-2xl"}
          >
            <Image
              src={item.url}
              alt={item.label}
              fill
              priority={index === 0}
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes={index === 0 ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 50vw, 20vw"}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <Badge className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-900">
                {item.label}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

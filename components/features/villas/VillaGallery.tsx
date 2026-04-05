// components/features/villas/VillaGallery.tsx
import Image from "next/image";

export default function VillaGallery({ images }: { images: any[] }) {
  const displayImages = images
    .sort((a, b) => (b.is_primary ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[300px] md:h-[450px] rounded-2xl overflow-hidden">
      <div className="md:col-span-2 relative h-full">
        <Image
          src={displayImages[0]?.image_url}
          alt="Main Gallery"
          fill
          priority
          className="object-cover hover:opacity-90 transition cursor-pointer"
        />
      </div>
      <div className="hidden md:grid grid-cols-2 col-span-2 gap-2">
        {displayImages.slice(1).map((img, i) => (
          <div key={i} className="relative h-full">
            <Image
              src={img.image_url}
              alt={`Gallery ${i}`}
              fill
              className="object-cover hover:opacity-90 transition cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

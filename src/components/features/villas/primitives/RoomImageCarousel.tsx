"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomImageCarouselProps {
  images: string[];
  roomName: string;
  fallbackImage?: string;
  rootClassName?: string;
  imageClassName?: string;
  sizes?: string;
  topBadge?: ReactNode;
  bottomOverlayClassName?: string;
  topOverlayClassName?: string;
  leftNavClassName?: string;
  rightNavClassName?: string;
  dotContainerClassName?: string;
  activeDotClassName?: string;
  inactiveDotClassName?: string;
  showDots?: boolean;
  showPhotoCounter?: boolean;
  photoCounterClassName?: string;
  showCameraIconInCounter?: boolean;
}

export function RoomImageCarousel({
  images,
  roomName,
  fallbackImage = "/images/hero-villa.jpg",
  rootClassName,
  imageClassName,
  sizes = "(max-width: 1024px) 100vw, 33vw",
  topBadge,
  bottomOverlayClassName,
  topOverlayClassName,
  leftNavClassName,
  rightNavClassName,
  dotContainerClassName,
  activeDotClassName,
  inactiveDotClassName,
  showDots = true,
  showPhotoCounter = true,
  photoCounterClassName,
  showCameraIconInCounter = false,
}: RoomImageCarouselProps) {
  const imageList = useMemo(
    () => (images.length > 0 ? images : [fallbackImage]),
    [images, fallbackImage]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [current, setCurrent] = useState(0);

  const scrollPrev = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      emblaApi?.scrollPrev();
    },
    [emblaApi]
  );

  const scrollNext = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      emblaApi?.scrollNext();
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const handleSelect = () => {
      setCurrent(emblaApi.selectedScrollSnap());
    };

    handleSelect();
    emblaApi.on("select", handleSelect);

    return () => {
      emblaApi.off("select", handleSelect);
    };
  }, [emblaApi]);

  return (
    <div className={cn("relative overflow-hidden bg-slate-100", rootClassName)}>
      <div ref={emblaRef} className="h-full overflow-hidden">
        <div className="flex h-full">
          {imageList.map((src, index) => (
            <div key={`${src}-${index}`} className="relative h-full flex-[0_0_100%] min-w-0">
              <Image
                src={src}
                alt={`${roomName} - foto ${index + 1}`}
                fill
                className={cn("object-cover transition-transform duration-700 ease-in-out", imageClassName)}
                sizes={sizes}
              />
            </div>
          ))}
        </div>
      </div>

      {bottomOverlayClassName ? (
        <div className={cn("pointer-events-none absolute inset-x-0 bottom-0", bottomOverlayClassName)} />
      ) : null}

      {topOverlayClassName ? (
        <div className={cn("pointer-events-none absolute inset-x-0 top-0", topOverlayClassName)} />
      ) : null}

      {topBadge}

      {imageList.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className={cn(
              "absolute left-2.5 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-all hover:bg-black/60",
              leftNavClassName
            )}
            aria-label="Foto sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className={cn(
              "absolute right-2.5 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-all hover:bg-black/60",
              rightNavClassName
            )}
            aria-label="Foto berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {showDots && imageList.length > 1 && (
        <div
          className={cn(
            "absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1 pointer-events-none",
            dotContainerClassName
          )}
        >
          {imageList.map((_, index) => (
            <span
              key={index}
              className={cn(
                "block rounded-full transition-all duration-300",
                index === current
                  ? cn("w-4 h-1.5 bg-white", activeDotClassName)
                  : cn("w-1.5 h-1.5 bg-white/50", inactiveDotClassName)
              )}
            />
          ))}
        </div>
      )}

      {showPhotoCounter && imageList.length > 1 && (
        <div
          className={cn(
            "absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm",
            photoCounterClassName
          )}
        >
          <span className={cn("inline-flex items-center gap-1", !showCameraIconInCounter && "gap-0")}>
            {showCameraIconInCounter ? <Camera className="h-2.5 w-2.5" /> : null}
            {current + 1}/{imageList.length}
          </span>
        </div>
      )}
    </div>
  );
}

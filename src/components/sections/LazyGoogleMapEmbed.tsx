"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const GoogleMapEmbedFrame = dynamic(
  () => import("./GoogleMapEmbedFrame").then((module) => module.GoogleMapEmbedFrame),
  {
    ssr: false,
  }
);

interface LazyGoogleMapEmbedProps {
  title: string;
  src: string;
}

export function LazyGoogleMapEmbed({ title, src }: LazyGoogleMapEmbedProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="absolute inset-0">
      {isVisible ? (
        <GoogleMapEmbedFrame title={title} src={src} />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#d9dece] via-[#eef2e6] to-[#f6f7f2]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

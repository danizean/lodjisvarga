"use client";

interface GoogleMapEmbedFrameProps {
  title: string;
  src: string;
}

export function GoogleMapEmbedFrame({ title, src }: GoogleMapEmbedFrameProps) {
  return (
    <iframe
      title={title}
      src={src}
      className="absolute inset-0 h-full w-full border-0 grayscale-[0.1] contrast-[1.05]"
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

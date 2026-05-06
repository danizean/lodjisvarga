"use client";

import { useEffect, useState } from "react";

interface VillaFloatingCTAProps {
  whatsappNumber: string | null;
  villaName: string;
  isActive: boolean;
}

const WaIcon = () => (
  <svg className="h-4 w-4 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
  </svg>
);

/**
 * Floating WhatsApp CTA — mobile only (hidden on lg+).
 *
 * Behavior:
 * - Hidden on load (scroll position = 0)
 * - Appears after user scrolls 80vh past the hero (threshold: 500px)
 * - Hides smoothly when user scrolls back near the top
 * - Hidden entirely on lg+ screens (desktop has unit card CTAs always visible)
 */
export function VillaFloatingCTA({ whatsappNumber, villaName, isActive }: VillaFloatingCTAProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isActive || !whatsappNumber) return;

    const THRESHOLD = 500; // ~below hero fold

    const handleScroll = () => {
      setVisible(window.scrollY > THRESHOLD);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isActive, whatsappNumber]);

  if (!isActive || !whatsappNumber) return null;

  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Halo Lodjisvarga, saya ingin menanyakan ketersediaan kamar di ${villaName}. Reff: Villa Detail`
  )}`;

  return (
    <div
      className={`fixed bottom-5 right-4 z-50 lg:hidden transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-hidden={!visible}
    >
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Tanya ketersediaan via WhatsApp"
        className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-xl shadow-black/20 transition-all hover:bg-[#1ebe5d] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50"
      >
        <WaIcon />
        Tanya via WhatsApp
      </a>
    </div>
  );
}

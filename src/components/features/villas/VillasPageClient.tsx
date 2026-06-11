"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, MapPin } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { VillaCard } from "@/components/features/villas/VillaCard";
import { flattenToRoomCards } from "@/lib/mappers/public-villas";
import type { ActivePromoData, PublicVillaData } from "@/types/public-villas";

const LOCATION_FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Sleman", value: "sleman" },
  { label: "Seturan", value: "seturan" },
] as const;

interface Props {
  villas: PublicVillaData[];
  activePromo?: ActivePromoData;
}

export function VillasPageClient({ villas, activePromo = null }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const allCards = useMemo(
    () =>
      flattenToRoomCards(villas, activePromo, {
        includeComingSoonPlaceholder: true,
        highlightLimit: 3,
        fallbackToFirstAmenities: false,
      }),
    [villas, activePromo]
  );

  const { filteredCards, totalActive } = useMemo(() => {
    const activeCards = allCards.filter(
      (card) => card.villaStatus !== "coming_soon"
    );
    const total = activeCards.length;

    let cards = activeCards;

    if (activeFilter !== "all") {
      cards = cards.filter((card) => {
        const villaName = card.villaName.toLowerCase();
        const filter = activeFilter.toLowerCase();
        if (filter === "sleman") {
          return villaName.includes("sleman") && !villaName.includes("seturan");
        }
        return villaName.includes(filter);
      });
    }

    return { filteredCards: cards, totalActive: total };
  }, [allCards, activeFilter]);

  const hasActiveFilters = activeFilter !== "all";

  return (
    <main className="bg-[#F7F6F2] min-h-screen">
      {/* Premium Hero Header */}
      <section className="bg-transparent pt-36 pb-20 relative overflow-hidden">
        {/* Decorative radial glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 70% 20%, rgba(212,175,55,0.12) 0%, transparent 70%)",
          }}
        />

        <Container className="max-w-6xl px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-4 mb-5"
          >
            <div className="h-px w-8 md:w-12 bg-[#D4AF37]/50" />
            <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-[10px] md:text-xs">
              Villa Kami
            </span>
            <div className="h-px w-8 md:w-12 bg-[#D4AF37]/50" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="font-serif text-[#3A4A1F] text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight"
          >
            Temukan <span className="italic text-[#D4AF37]">Kenyamanan</span>{" "}
            Anda
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mt-4 mb-6 text-lg md:text-xl text-gray-400 leading-snug tracking-wide"
          >
            Harga mulai dari{" "}
            <strong className="font-bold text-[#3A4A1F] text-xl md:text-2xl">
              Rp370.000&nbsp;/&nbsp;malam
            </strong>{" "}
            <em className="text-xs md:text-sm font-normal not-italic italic text-gray-400">
              (S&amp;K Berlaku)
            </em>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-[#3A4A1F]/60 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed"
          >
            {totalActive} unit villa yang dirancang khusus untuk ketenangan
            dan kemewahan pengalaman menginap Anda di Yogyakarta.
          </motion.p>
        </Container>
      </section>

      {/* Sticky Floating Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="sticky top-20 z-40 -mt-6 mb-10 flex justify-center px-3 sm:px-4 md:px-6 pointer-events-none"
      >
        <div
          role="region"
          aria-label="Filter villa"
          className="pointer-events-auto w-full max-w-4xl rounded-3xl md:rounded-full border border-white/55 bg-white/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/55 shadow-[0_10px_40px_rgba(58,74,31,0.12)] px-2.5 py-2 md:px-3 md:py-2.5"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            {/* Location Filters */}
            <nav
              aria-label="Filter lokasi"
              className="grid w-full grid-cols-3 items-center gap-1 md:flex md:w-auto md:flex-1 md:gap-1.5"
            >
              {LOCATION_FILTERS.map((filter) => {
                const isActive = activeFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    aria-pressed={isActive}
                    aria-label={`Filter lokasi: ${filter.label}`}
                    className={`relative flex min-h-11 items-center justify-center px-2 py-2.5 md:min-h-10 md:flex-none md:px-6 rounded-2xl md:rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.16em] md:tracking-widest font-bold transition-colors duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 ${
                      isActive
                        ? "text-white"
                        : "text-[#3A4A1F]/50 hover:text-[#3A4A1F]"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-1.5">
                      {filter.value !== "all" && (
                        <MapPin
                          aria-hidden="true"
                          className={`h-3 w-3 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
                        />
                      )}
                      {filter.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="villasPageActiveTab"
                        className="absolute inset-0 z-0 rounded-2xl md:rounded-full bg-[#3A4A1F] shadow-[0_4px_14px_rgba(58,74,31,0.28)]"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Divider - desktop only */}
            <div aria-hidden="true" className="hidden h-8 w-px bg-slate-300/60 md:block" />

            {/* Result count badge */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="flex items-center justify-center rounded-xl bg-white/55 px-3 py-1.5 text-[11px] text-slate-600 font-medium whitespace-nowrap md:rounded-full md:bg-transparent md:px-1 md:py-0 md:pr-2"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={filteredCards.length}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold text-[#3A4A1F]"
                >
                  {filteredCards.length}
                </motion.span>
              </AnimatePresence>
              <span className="ml-1.5">unit ditemukan</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Villa Grid */}
      <Container className="max-w-6xl px-6 pb-32">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredCards.length > 0 ? (
            <motion.div
              layout
              key="grid"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            >
              {filteredCards.map((card, index) => (
                <motion.div
                  layout
                  key={card.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.38,
                    delay: Math.min(index * 0.05, 0.3),
                    ease: "easeOut",
                  }}
                >
                  <VillaCard room={card} priority={index < 3} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-24 px-8 text-center bg-white/40 rounded-[3rem] border border-dashed border-[#3A4A1F]/10 mx-auto max-w-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#3A4A1F]/5 flex items-center justify-center mb-6 rotate-3">
                <LayoutGrid className="w-7 h-7 text-[#3A4A1F]/20" />
              </div>
              <h2 className="text-[#3A4A1F] font-serif text-2xl mb-3">
                Tidak ada unit ditemukan
              </h2>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
                Tidak ada unit tersedia untuk filter lokasi ini saat ini.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setActiveFilter("all");
                  }}
                  className="rounded-full bg-[#3A4A1F] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#2A3A1F] hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/50 focus-visible:ring-offset-2"
                >
                  Reset Filter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </main>
  );
}

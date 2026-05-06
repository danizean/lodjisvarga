"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/shared/Container";
import { VillaCard } from "@/components/features/villas/VillaCard";
import { LayoutGrid, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { flattenToRoomCards } from "@/lib/mappers/public-villas";
import type { ActivePromoData, PublicVillaData } from "@/types/public-villas";

const LOCATION_FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Sleman", value: "sleman" },
  { label: "Seturan", value: "seturan" },
] as const;

interface Props {
  villas: PublicVillaData[];
  activePromo?: ActivePromoData | null;
}

export function FeaturedVillasClient({ villas, activePromo = null }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const allCards = useMemo(() => {
    return flattenToRoomCards(villas, activePromo, {
      includeComingSoonPlaceholder: true,
      highlightLimit: 3,
      fallbackToFirstAmenities: false,
    });
  }, [villas, activePromo]);

  const filteredCards = useMemo(() => {
    const baseCards = allCards.filter((card) => card.villaStatus !== "coming_soon");
    if (activeFilter === "all") return baseCards;

    return baseCards.filter((card) => {
      const villaName = card.villaName.toLowerCase();
      const filter = activeFilter.toLowerCase();
      if (filter === "sleman") {
        return villaName.includes("sleman") && !villaName.includes("seturan");
      }
      return villaName.includes(filter);
    });
  }, [allCards, activeFilter]);

  return (
    <section id="featured-villas" className="relative pt-8 pb-16 md:pt-12 md:pb-24 bg-[#F7F6F2] scroll-mt-24">
      <Container className="max-w-6xl px-6 md:px-12 relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-4 mb-3"
          >
            <div className="h-px w-8 bg-[#D4AF37]/30" />
            <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-[9px] md:text-[10px]">
              Our Villa
            </span>
            <div className="h-px w-8 bg-[#D4AF37]/30" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="font-serif text-3xl md:text-5xl text-[#3A4A1F] leading-tight"
          >
            Unit Kamar <span className="italic text-[#D4AF37]">Lodjisvarga</span>
          </motion.h2>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-20 md:top-24 z-40 py-4 mb-10 flex justify-center pointer-events-none">
          <nav
            aria-label="Filter lokasi villa"
            className="bg-white/90 backdrop-blur-xl p-1.5 rounded-full inline-flex gap-1 shadow-xl shadow-[#3A4A1F]/5 border border-white/50 pointer-events-auto"
          >
            {LOCATION_FILTERS.map((f) => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  aria-pressed={isActive}
                  aria-label={`Filter: ${f.label}`}
                  className={`relative px-6 md:px-8 py-2.5 rounded-full text-[10px] md:text-[11px] uppercase tracking-widest font-bold transition-colors duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 ${
                    isActive ? "text-white" : "text-[#3A4A1F]/40 hover:text-[#3A4A1F]"
                  }`}
                >
                  <span className="relative z-10">{f.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabLuxury"
                      className="absolute inset-0 bg-[#3A4A1F] rounded-full z-0 shadow-md"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Grid */}
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.38,
                    delay: Math.min(index * 0.05, 0.25),
                    ease: "easeOut",
                  }}
                >
                  <VillaCard room={card} />
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
                <MapPin className="w-7 h-7 text-[#3A4A1F]/20" />
              </div>
              <h3 className="text-[#3A4A1F] font-serif text-2xl mb-3">Unit Sedang Disiapkan</h3>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                Kami sedang melakukan standarisasi kualitas untuk lokasi{" "}
                <span className="text-[#D4AF37] font-bold">{activeFilter}</span>.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </Container>
    </section>
  );
}
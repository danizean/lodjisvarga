"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, X, MapPin } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(q) ||
          card.villaName.toLowerCase().includes(q) ||
          (card.description ?? "").toLowerCase().includes(q) ||
          (card.bed_type ?? "").toLowerCase().includes(q)
      );
    }

    return { filteredCards: cards, totalActive: total };
  }, [allCards, activeFilter, searchQuery]);

  const hasActiveFilters = activeFilter !== "all" || searchQuery.trim() !== "";

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
            className="font-serif text-[#3A4A1F] text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight"
          >
            Temukan <span className="italic text-[#D4AF37]">Kenyamanan</span>{" "}
            Anda
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            className="text-[#3A4A1F]/60 max-w-xl mx-auto text-sm md:text-base font-light leading-relaxed"
          >
            {totalActive} unit villa yang dirancang khusus untuk ketenangan
            dan kemewahan pengalaman menginap Anda di Yogyakarta.
          </motion.p>
        </Container>
      </section>

      {/* Sticky Floating Filter & Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="sticky top-20 z-40 -mt-6 mb-10 flex justify-center px-4 md:px-6 pointer-events-none"
      >
        <div
          role="search"
          aria-label="Filter dan cari villa"
          className="bg-white/95 backdrop-blur-xl p-2 rounded-3xl md:rounded-full shadow-2xl shadow-[#3A4A1F]/10 border border-white/60 pointer-events-auto flex flex-col md:flex-row items-center gap-2 max-w-4xl w-full"
        >
          {/* Search Input */}
          <div className="relative w-full md:w-72 flex-shrink-0">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            />
            <input
              type="search"
              id="villas-search"
              aria-label="Cari lokasi atau nama kamar"
              placeholder="Cari lokasi atau nama kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 md:h-11 bg-slate-50/50 hover:bg-slate-100/50 rounded-2xl md:rounded-full border-none pl-11 pr-10 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-[#D4AF37]/30 transition-all outline-none"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearchQuery("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 bg-white rounded-full shadow-sm transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Divider — desktop only */}
          <div aria-hidden="true" className="hidden md:block w-px h-8 bg-slate-200 mx-1" />

          {/* Location Filters */}
          <nav
            aria-label="Filter lokasi"
            className="flex items-center justify-center gap-1 w-full md:w-auto p-1 md:p-0"
          >
            {LOCATION_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  aria-pressed={isActive}
                  aria-label={`Filter lokasi: ${filter.label}`}
                  className={`relative flex-1 md:flex-none px-4 md:px-7 py-2.5 rounded-full text-[10px] md:text-[11px] uppercase tracking-widest font-bold transition-colors duration-300 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 ${
                    isActive
                      ? "text-white"
                      : "text-[#3A4A1F]/40 hover:text-[#3A4A1F]"
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
                      className="absolute inset-0 bg-[#3A4A1F] rounded-full z-0 shadow-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider — desktop only */}
          <div aria-hidden="true" className="hidden md:block w-px h-8 bg-slate-200 mx-1" />

          {/* Result count badge */}
          <div
            aria-live="polite"
            aria-atomic="true"
            className="hidden md:flex items-center gap-1.5 pr-3 text-[11px] text-slate-500 font-medium whitespace-nowrap flex-shrink-0"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={filteredCards.length}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
                className="text-[#3A4A1F] font-bold"
              >
                {filteredCards.length}
              </motion.span>
            </AnimatePresence>
            <span>unit ditemukan</span>
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
                <LayoutGrid className="w-7 h-7 text-[#3A4A1F]/20" />
              </div>
              <h2 className="text-[#3A4A1F] font-serif text-2xl mb-3">
                Tidak ada unit ditemukan
              </h2>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-8">
                {searchQuery
                  ? `Tidak ada unit yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
                  : "Tidak ada unit tersedia untuk filter lokasi ini saat ini."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setActiveFilter("all");
                    setSearchQuery("");
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

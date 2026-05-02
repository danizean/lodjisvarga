"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { VillaCard } from "@/components/features/villas/VillaCard";
import { flattenToRoomCards } from "@/lib/mappers/public-villas";
import type { ActivePromoData, PublicVillaData } from "@/types/public-villas";

const LOCATION_FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Sleman", value: "sleman" },
  { label: "Seturan", value: "seturan" },
];

interface Props {
  villas: PublicVillaData[];
  activePromo?: ActivePromoData;
}

export function VillasPageClient({ villas, activePromo = null }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
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

  const filteredCards = useMemo(() => {
    let cards = allCards;

    if (activeFilter !== "all") {
      cards = cards.filter((card) =>
        card.villaName.toLowerCase().includes(activeFilter.toLowerCase())
      );
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

    return cards;
  }, [allCards, activeFilter, searchQuery]);

  const totalActive = allCards.filter((card) => card.villaStatus !== "coming_soon").length;

  return (
    <section className="min-h-screen bg-[#F7F6F2] pb-28">
      <Container className="max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
              Koleksi Villa
            </p>
            <p className="mt-0.5 text-sm text-[#3A4A1F]/60">
              Menampilkan{" "}
              <span className="font-semibold text-[#3A4A1F]">{filteredCards.length}</span>{" "}
              dari {totalActive} unit aktif
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="villa-search"
                type="text"
                placeholder="Cari villa atau kamar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-full border border-[#3A4A1F]/10 bg-white pl-9 pr-9 text-sm text-gray-700 placeholder-gray-400 shadow-sm outline-none ring-0 transition focus:border-[#3A4A1F]/30 focus:ring-2 focus:ring-[#3A4A1F]/10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div
              className="flex items-center gap-1 rounded-full border border-[#3A4A1F]/10 bg-white p-1 shadow-sm"
              role="group"
              aria-label="Filter lokasi"
            >
              <SlidersHorizontal className="ml-2 h-3.5 w-3.5 text-[#3A4A1F]/40" />
              {LOCATION_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  id={`filter-${filter.value}`}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`relative px-5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-400 whitespace-nowrap ${
                    activeFilter === filter.value
                      ? "text-white"
                      : "text-[#3A4A1F]/50 hover:text-[#3A4A1F]"
                  }`}
                >
                  <span className="relative z-10">{filter.label}</span>
                  {activeFilter === filter.value && (
                    <motion.div
                      layoutId="villasPageActiveTab"
                      className="absolute inset-0 rounded-full bg-[#3A4A1F] z-0 shadow-md"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {filteredCards.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:gap-8">
              {filteredCards.map((card, index) => (
                <motion.div
                  layout
                  key={card.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: index * 0.06, duration: 0.4 } }}
                  exit={{ opacity: 0, scale: 0.96 }}
                >
                  <VillaCard room={card} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#3A4A1F]/5">
                <LayoutGrid className="h-8 w-8 text-[#3A4A1F]/20" />
              </div>
              <p className="font-serif text-xl font-bold text-[#3A4A1F]">Tidak ada unit ditemukan</p>
              <p className="mt-2 max-w-xs text-sm text-gray-400">
                Coba ubah filter lokasi atau kata kunci pencarian Anda.
              </p>
              <button
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="mt-6 rounded-full bg-[#3A4A1F] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#2A3A1F]"
              >
                Reset Filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}

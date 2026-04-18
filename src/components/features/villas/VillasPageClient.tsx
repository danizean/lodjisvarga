"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { VillaCard, type RoomTypeCardData } from "@/components/features/villas/VillaCard";
import type { VillaData, ActivePromoData } from "@/components/sections/FeaturedVillasClient";

// ─── Location filter config ───────────────────────────────────────────────────
const LOCATION_FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Sleman", value: "sleman" },
  { label: "Seturan", value: "seturan" },
];

// ─── Flatten villas to flat room-card list ───────────────────────────────────
function flattenToRoomCards(
  villas: VillaData[],
  activePromo: ActivePromoData
): RoomTypeCardData[] {
  const cards: RoomTypeCardData[] = [];
  for (const villa of villas) {
    if (villa.room_types.length === 0 && villa.status === "coming_soon") {
      cards.push({
        id: villa.id + "_placeholder",
        name: "Segera Hadir",
        base_price: 0,
        effective_price: 0,
        price_source: "base",
        activePromo,
        capacity_adult: null,
        capacity_child: null,
        description: villa.description,
        gallery: [],
        villaName: villa.name,
        villaSlug: villa.slug,
        villaStatus: villa.status,
        villaWhatsapp: villa.whatsapp_number,
      });
      continue;
    }
    for (const rt of villa.room_types) {
      cards.push({
        id: rt.id,
        name: rt.name,
        base_price: rt.base_price,
        effective_price: rt.effective_price ?? 0,
        price_source: rt.price_source ?? "base",
        activePromo,
        capacity_adult: rt.capacity_adult,
        capacity_child: rt.capacity_child,
        description: rt.description,
        gallery: rt.gallery,
        villaName: villa.name,
        villaSlug: villa.slug,
        villaStatus: villa.status,
        villaWhatsapp: villa.whatsapp_number,
      });
    }
  }
  return cards;
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  villas: VillaData[];
  activePromo?: ActivePromoData;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function VillasPageClient({ villas, activePromo = null }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allCards = useMemo(
    () => flattenToRoomCards(villas, activePromo),
    [villas, activePromo]
  );

  const filteredCards = useMemo(() => {
    let cards = allCards;

    // Location filter
    if (activeFilter !== "all") {
      cards = cards.filter((card) =>
        card.villaName.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(q) ||
          card.villaName.toLowerCase().includes(q) ||
          (card.description ?? "").toLowerCase().includes(q)
      );
    }

    return cards;
  }, [allCards, activeFilter, searchQuery]);

  const totalActive = allCards.filter(
    (c) => c.villaStatus !== "coming_soon"
  ).length;

  return (
    <section className="min-h-screen bg-[#F7F6F2] pb-28">
      <Container className="max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">

        {/* ── Toolbar ── */}
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          {/* Result count */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
              Koleksi Villa
            </p>
            <p className="mt-0.5 text-sm text-[#3A4A1F]/60">
              Menampilkan{" "}
              <span className="font-semibold text-[#3A4A1F]">
                {filteredCards.length}
              </span>{" "}
              dari {totalActive} unit aktif
            </p>
          </div>

          {/* Search + Filter row */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="villa-search"
                type="text"
                placeholder="Cari villa atau kamar…"
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

            {/* Location filter pills */}
            <div
              className="flex items-center gap-1 rounded-full border border-[#3A4A1F]/10 bg-white p-1 shadow-sm"
              role="group"
              aria-label="Filter lokasi"
            >
              <SlidersHorizontal className="ml-2 h-3.5 w-3.5 text-[#3A4A1F]/40" />
              {LOCATION_FILTERS.map((f) => (
                <button
                  key={f.value}
                  id={`filter-${f.value}`}
                  onClick={() => setActiveFilter(f.value)}
                  className={`relative px-5 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all duration-400 whitespace-nowrap ${
                    activeFilter === f.value
                      ? "text-white"
                      : "text-[#3A4A1F]/50 hover:text-[#3A4A1F]"
                  }`}
                >
                  <span className="relative z-10">{f.label}</span>
                  {activeFilter === f.value && (
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

        {/* ── Card Grid ── */}
        <AnimatePresence mode="popLayout">
          {filteredCards.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10"
            >
              {filteredCards.map((card, idx) => (
                <motion.div
                  layout
                  key={card.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.06, duration: 0.4 } }}
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
              <p className="font-serif text-xl font-bold text-[#3A4A1F]">
                Tidak ada unit ditemukan
              </p>
              <p className="mt-2 max-w-xs text-sm text-gray-400">
                Coba ubah filter lokasi atau kata kunci pencarian Anda.
              </p>
              <button
                onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}
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

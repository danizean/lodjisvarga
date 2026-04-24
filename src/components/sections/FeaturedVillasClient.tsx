"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/shared/Container";
import { VillaCard, type RoomTypeCardData } from "@/components/features/villas/VillaCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────
export type VillaData = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "coming_soon" | "inactive" | string;
  address: string | null;
  description: string | null;
  whatsapp_number: string | null;
  gmaps_url: string | null;
  room_types: {
    id: string;
    name: string;
    base_price: number;
    effective_price?: number;
    price_source?: "base" | "override";
    // Legacy – kept for backwards-compat; NOT rendered in UI
    capacity_adult?: number | null;
    capacity_child?: number | null;
    // USP fields – the Supabase query MUST select bed_type, highlight_amenity_ids
    // and join room_type_amenities(amenities(id, name, icon_name)).
    bed_type?: string | null;
    /** Raw UUID array from DB; the flattener resolves this into highlight_amenities objects */
    highlight_amenity_ids?: string[];
    room_type_amenities?: {
      amenities: { id: string; name: string; icon_name: string | null } | null;
    }[];
    description: string | null;
    gallery: {
      image_url: string;
      is_primary: boolean | null;
      display_order: number | null;
    }[];
  }[];
  villa_amenities: {
    amenities: {
      id: string;
      name: string;
      icon_name: string | null;
    } | null;
  }[];
};

export type ActivePromoData = {
  id: string;
  title: string;
  discount_code: string;
  discount_value: number | null;
  expired_at: string | null;
  is_active: boolean | null;
} | null;

const LOCATION_FILTERS = [
  { label: "Semua", value: "all" },
  { label: "Sleman", value: "sleman" },
  { label: "Seturan", value: "seturan" },
];

function flattenToRoomCards(villas: VillaData[], activePromo: ActivePromoData): RoomTypeCardData[] {
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
        // USP fields – no room data available for placeholder cards
        bed_type: null,
        amenities: [],
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
      // Extract all amenity objects from the Supabase join shape
      const amenities = (rt.room_type_amenities ?? [])
        .flatMap((link) => (link.amenities ? [link.amenities] : []));

      // Resolve the up-to-3 highlighted amenity objects from the raw ID array
      const highlightIds = rt.highlight_amenity_ids ?? [];
      const highlight_amenities = highlightIds
        .map((hid) => amenities.find((a) => a.id === hid))
        .filter((a): a is { id: string; name: string; icon_name: string | null } => Boolean(a))
        .slice(0, 3);

      cards.push({
        id: rt.id,
        name: rt.name,
        base_price: rt.base_price,
        effective_price: rt.effective_price ?? 0,
        price_source: rt.price_source ?? "base",
        activePromo,
        // USP fields
        bed_type: rt.bed_type ?? null,
        amenities,
        highlight_amenities,
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

interface Props {
  villas: VillaData[];
  activePromo?: ActivePromoData;
}

export function FeaturedVillasClient({ villas, activePromo = null }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");

  const allCards = useMemo(() => flattenToRoomCards(villas, activePromo), [villas, activePromo]);

  const filteredCards = useMemo(() => {
    if (activeFilter === "all") {
      return allCards.filter(card => card.villaStatus !== "coming_soon");
    }
    return allCards.filter((card) => {
      const villaName = card.villaName.toLowerCase();
      if (activeFilter === "sleman") {
        return villaName.includes("sleman") && !villaName.includes("seturan");
      }
      return villaName.includes(activeFilter.toLowerCase());
    });
  }, [allCards, activeFilter]);

  return (
    <section id="featured-villas" className="relative pb-20 bg-[#F7F6F2] scroll-mt-20">
      
      {/* Container diturunkan sedikit (-mt-10 sampai -mt-16) agar ada jeda manis */}
      <Container className="max-w-6xl px-6 md:px-12 relative z-10 -mt-10 md:-mt-16">
        
        {/* Header - Jarak mb-10 memberikan napas yang pas */}
        <div className="text-center mb-10">
          <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-[9px]">
            Recommended Units
          </span>
          <h2 className="mt-2 font-serif text-4xl md:text-5xl text-[#3A4A1F] leading-tight">
            Unit Kamar <span className="italic text-[#D4AF37]">Terbaik</span>
          </h2>
        </div>

        {/* Location Filter Tabs - Menggunakan Glassmorphism transparan agar halus */}
        <div className="sticky top-[72px] z-40 py-4 mb-10 flex justify-center">
          <div className="bg-[#3A4A1F]/5 backdrop-blur-md p-1.5 rounded-full inline-flex gap-1 shadow-sm border border-[#3A4A1F]/10">
            {LOCATION_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`relative px-6 py-2 rounded-full text-[10px] md:text-[11px] uppercase tracking-widest font-bold transition-all duration-500 whitespace-nowrap ${
                  activeFilter === f.value
                    ? "text-white"
                    : "text-[#3A4A1F]/50 hover:text-[#3A4A1F]"
                }`}
              >
                <span className="relative z-10">{f.label}</span>
                {activeFilter === f.value && (
                  <motion.div 
                    layoutId="activeTabLuxuryFinal"
                    className="absolute inset-0 bg-[#3A4A1F] rounded-full z-0 shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <AnimatePresence mode="popLayout">
          {filteredCards.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10"
            >
              {filteredCards.map((card, idx) => (
                <motion.div
                  layout
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <VillaCard room={card} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white/20 rounded-[40px] border border-dashed border-[#3A4A1F]/10 mx-auto max-w-4xl">
              <LayoutGrid className="w-6 h-6 text-gray-300" />
              <div>
                <p className="text-lg font-bold text-[#3A4A1F]">Unit segera tersedia</p>
                <p className="text-gray-500 text-xs mt-1">
                  Kami sedang menyiapkan unit terbaik untuk lokasi ini.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </Container>
    </section>
  );
}
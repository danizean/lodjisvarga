"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/shared/Container";
import { VillaCard, type RoomTypeCardData } from "@/components/features/villas/VillaCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";

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
    capacity_adult: number | null;
    capacity_child: number | null;
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

const LOCATION_FILTERS = [
  { label: "Semua",  value: "all"     },
  { label: "Sleman", value: "sleman"  },
  { label: "Seturan",value: "seturan" },
];

// ─── Flatten villa → room type cards ─────────────────────────────────────
function flattenToRoomCards(villas: VillaData[]): RoomTypeCardData[] {
  const cards: RoomTypeCardData[] = [];

  for (const villa of villas) {
    // coming_soon villa with no room types → show a placeholder card
    if (villa.room_types.length === 0 && villa.status === "coming_soon") {
      cards.push({
        id: villa.id + "_placeholder",
        name: "Segera Hadir",
        base_price: 0,
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

// ─── Component ────────────────────────────────────────────────────────────
interface Props {
  villas: VillaData[];
}

export function FeaturedVillasClient({ villas }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");

  const allCards = useMemo(() => flattenToRoomCards(villas), [villas]);

  const filteredCards = useMemo(() => {
    if (activeFilter === "all") return allCards;
    return allCards.filter((card) =>
      card.villaName.toLowerCase().includes(activeFilter)
    );
  }, [allCards, activeFilter]);

  return (
    <section id="featured-villas" className="py-24 bg-white min-h-screen scroll-mt-20">
      <Container>
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-[#3A4A1F] font-bold tracking-[0.25em] uppercase text-xs">
            Limitless Privacy
          </span>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl font-bold text-gray-900">
            Pilih Kamar Impian Anda
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Setiap unit dirancang untuk memberikan pengalaman menginap yang tak terlupakan
            dengan privasi penuh di Yogyakarta.
          </p>
        </div>

        {/* Location Filter Tabs */}
        <div className="sticky top-[72px] z-40 bg-white/90 backdrop-blur-md py-4 mb-10 -mx-6 px-6 border-b border-gray-100/80">
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1.5 rounded-full inline-flex gap-1">
              {LOCATION_FILTERS.map((f) => (
                <button
                  key={f.value}
                  id={`filter-${f.value}`}
                  onClick={() => setActiveFilter(f.value)}
                  className={`px-7 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    activeFilter === f.value
                      ? "bg-white text-[#3A4A1F] shadow-md scale-105"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCards.map((card, idx) => (
              <div
                key={card.id}
                className="animate-in fade-in zoom-in-95 duration-500"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <VillaCard room={card} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-slate-50 rounded-[40px] border border-dashed border-slate-300">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <LayoutGrid className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">Tidak ada kamar di lokasi ini</p>
              <p className="text-slate-500 text-sm mt-1">
                Coba filter lokasi lain atau lihat semua kamar
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveFilter("all")}
              className="mt-2 rounded-full border-[#3A4A1F] text-[#3A4A1F]"
            >
              Tampilkan Semua
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
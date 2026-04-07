"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/shared/Container";
import { VillaCard } from "@/components/features/villas/VillaCard";
import { Button } from "@/components/ui/button";
import { Layout, Star } from "lucide-react";

// --- Types ---
export type VillaAmenity = {
  amenities: {
    id: string;
    name: string;
    icon_name: string | null;
  } | null;
};

export type VillaData = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "coming_soon" | "inactive" | string | null;
  address: string | null;
  description: string | null;
  whatsapp_number: string | null;
  room_types: {
    base_price: number;
    capacity_adult: number | null;
    capacity_child: number | null;
  }[];
  gallery: {
    image_url: string;
    is_primary: boolean | null;
  }[];
  villa_amenities: VillaAmenity[];
};

// Kategori dinamis (bisa disesuaikan dengan area project Anda)
const CATEGORIES = ["All", "Sleman", "Seturan", "Uluwatu"]; 

interface Props {
  villas: VillaData[];
}

export function FeaturedVillasClient({ villas }: Props) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredVillas = useMemo(() => {
    return villas.filter((villa) => {
      if (activeCategory === "All") return true;
      const keyword = activeCategory.toLowerCase();
      return (
        villa.name.toLowerCase().includes(keyword) ||
        villa.address?.toLowerCase().includes(keyword)
      );
    });
  }, [villas, activeCategory]);

  return (
    <section className="py-24 bg-white min-h-screen">
      <Container>
        {/* Header Section: Mengikuti gaya "Limitless Privacy" */}
        <div className="text-center mb-12">
          <span className="text-[#3A4A1F] font-bold tracking-widest uppercase text-sm">
            Limitless Privacy
          </span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-bold text-gray-900">
            Your Romantic Destination
          </h2>
        </div>

        {/* Sticky Category Tabs: Glassmorphism effect */}
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md py-4 mb-10 -mx-6 px-6 border-b border-gray-100/50">
          <div className="flex justify-center overflow-x-auto no-scrollbar">
            <div className="bg-gray-100 p-1.5 rounded-full inline-flex gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-white text-[#3A4A1F] shadow-md scale-105"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {cat} Style
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Card: Dinamis 100% */}
        {filteredVillas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {filteredVillas.map((villa) => (
              <div 
                key={villa.id}
                className="animate-in fade-in zoom-in-95 duration-500"
              >
                <VillaCard villa={villa} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 bg-slate-50 rounded-[40px] border border-dashed border-slate-300">
            <div className="p-4 bg-white rounded-full shadow-sm">
              <Layout className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-800">No matching villas</p>
              <p className="text-slate-500">We couldn't find any results for "{activeCategory}"</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => setActiveCategory("All")}
              className="mt-2 rounded-full border-[#3A4A1F] text-[#3A4A1F]"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
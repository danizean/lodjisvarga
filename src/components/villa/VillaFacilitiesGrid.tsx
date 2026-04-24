import { CheckCircle2, Waves, Wifi, CarFront, Wind, Coffee, Utensils, Bath, Tv } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface VillaFacilitiesGridProps {
  facilities: string[];
}

/**
 * Map of keyword → icon for common facilities.
 * Case-insensitive substring match — works with Indonesian & English facility names.
 */
const FACILITY_ICON_MAP: { keywords: string[]; Icon: React.ElementType }[] = [
  { keywords: ["pool", "kolam"], Icon: Waves },
  { keywords: ["wifi", "internet"], Icon: Wifi },
  { keywords: ["parkir", "parking", "garasi"], Icon: CarFront },
  { keywords: ["ac", "pendingin", "air cond"], Icon: Wind },
  { keywords: ["sarapan", "breakfast", "coffee", "kopi"], Icon: Coffee },
  { keywords: ["dapur", "kitchen", "masak", "utensil"], Icon: Utensils },
  { keywords: ["kamar mandi", "bathroom", "shower", "bath"], Icon: Bath },
  { keywords: ["tv", "televisi", "netflix"], Icon: Tv },
];

function getFacilityIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  const match = FACILITY_ICON_MAP.find((entry) =>
    entry.keywords.some((kw) => lower.includes(kw))
  );
  return match?.Icon ?? CheckCircle2;
}

/** First 6 are "popular" and always visible. Rest are collapsed. */
const POPULAR_COUNT = 6;

export function VillaFacilitiesGrid({ facilities }: VillaFacilitiesGridProps) {
  const safe = (facilities ?? []).filter(Boolean);
  if (safe.length === 0) return null;

  const popular = safe.slice(0, POPULAR_COUNT);
  const rest = safe.slice(POPULAR_COUNT);

  return (
    <section
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      aria-label="Fasilitas villa"
    >
      {/* Header */}
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">
          Facilities
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Fasilitas utama properti
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {safe.length} fasilitas tersedia
        </p>
      </div>

      {/* Popular grid — always visible */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {popular.map((facility) => {
          const Icon = getFacilityIcon(facility);
          return (
            <div
              key={facility}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]" aria-hidden="true" />
              <p className="text-sm font-medium text-slate-700">{facility}</p>
            </div>
          );
        })}
      </div>

      {/* Remaining — collapsed in accordion */}
      {rest.length > 0 && (
        <div className="mt-4">
          <Accordion className="w-full">
            <AccordionItem value="more-facilities" className="border-0">
              <AccordionTrigger className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-[#3A4A1F] no-underline hover:bg-slate-100 hover:no-underline">
                Lihat {rest.length} fasilitas lainnya
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {rest.map((facility) => {
                    const Icon = getFacilityIcon(facility);
                    return (
                      <div
                        key={facility}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3"
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]" aria-hidden="true" />
                        <p className="text-sm font-medium text-slate-700">{facility}</p>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </section>
  );
}

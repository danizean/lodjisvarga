"use client";

import {
  CheckCircle2,
  Waves,
  Wifi,
  CarFront,
  Wind,
  Coffee,
  Utensils,
  Bath,
  Tv,
} from "lucide-react";
import { useState } from "react";
import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Rich amenity object coming directly from the DB join. */
export type AmenityItem = {
  id: string;
  name: string;
  icon_name: string | null;
};

interface VillaFacilitiesGridProps {
  /**
   * Prefer `amenities` (rich objects with icon_name) over the legacy `facilities` string array.
   * Both are supported for backward-compatibility.
   */
  amenities?: AmenityItem[];
  /** @deprecated Pass `amenities` instead. Kept for backward-compat. */
  facilities?: string[];
}

// ─── Legacy icon fallback (keyword → Lucide icon) ─────────────────────────────

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

// ─── Amenity Chip ─────────────────────────────────────────────────────────────

function AmenityChip({
  name,
  iconName,
}: {
  name: string;
  iconName?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:border-[#3A4A1F]/20 hover:bg-[#3A4A1F]/5">
      <LucideDynamicIcon
        iconName={iconName ?? null}
        amenityName={name}
        className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]"
      />
      <p className="text-sm font-medium text-slate-700">{name}</p>
    </div>
  );
}

function LegacyChip({ name }: { name: string }) {
  const Icon = getFacilityIcon(name);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:border-[#3A4A1F]/20 hover:bg-[#3A4A1F]/5">
      <Icon className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700">{name}</p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_VISIBLE = 9;

export function VillaFacilitiesGrid({ amenities, facilities }: VillaFacilitiesGridProps) {
  const [expanded, setExpanded] = useState(false);

  // Prefer rich amenity objects; fall back to legacy string array
  const usingRich = Array.isArray(amenities) && amenities.length > 0;
  const totalCount = usingRich
    ? amenities!.length
    : (facilities ?? []).filter(Boolean).length;

  if (totalCount === 0) return null;

  const richVisible = usingRich
    ? expanded
      ? amenities!
      : amenities!.slice(0, INITIAL_VISIBLE)
    : [];

  const legacyItems = !usingRich ? (facilities ?? []).filter(Boolean) : [];
  const legacyVisible = !usingRich
    ? expanded
      ? legacyItems
      : legacyItems.slice(0, INITIAL_VISIBLE)
    : [];

  const hasMore = totalCount > INITIAL_VISIBLE;

  return (
    <section
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      aria-label="Fasilitas properti"
    >
      {/* Header */}
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">
          Facilities
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Fasilitas properti
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {totalCount} fasilitas tersedia di seluruh properti
        </p>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {usingRich
          ? richVisible.map((a) => (
              <AmenityChip key={a.id} name={a.name} iconName={a.icon_name} />
            ))
          : legacyVisible.map((name) => (
              <LegacyChip key={name} name={name} />
            ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-[#3A4A1F]/20 bg-slate-50 px-6 py-2.5 text-sm font-semibold text-[#3A4A1F] transition-all hover:border-[#3A4A1F]/40 hover:bg-[#3A4A1F]/5"
          >
            {expanded
              ? "Sembunyikan fasilitas"
              : `Lihat ${totalCount - INITIAL_VISIBLE} fasilitas lainnya`}
          </button>
        </div>
      )}
    </section>
  );
}

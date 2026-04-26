"use client";

import { useState } from "react";
import { Pin, PinOff, Star, Sparkles, Check, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Amenity {
  id: string;
  name: string;
  icon_name?: string | null;
}

interface AmenityHighlightManagerProps {
  /** All amenities available for this room (already filtered to room's selected IDs) */
  roomAmenities: Amenity[];
  /** IDs of all amenities selected for this room */
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  /** IDs of highlighted amenities (max 4) */
  highlightIds: string[];
  onHighlightChange: (ids: string[]) => void;
  /** All available amenities (for selection) */
  allAmenities: Amenity[];
}

const HIGHLIGHT_SLOTS = 4;

export function AmenityHighlightManager({
  roomAmenities,
  selectedIds,
  onSelectedChange,
  highlightIds,
  onHighlightChange,
  allAmenities,
}: AmenityHighlightManagerProps) {
  const [search, setSearch] = useState("");

  const toggleSelected = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectedChange(selectedIds.filter((x) => x !== id));
      // auto-remove from highlights
      onHighlightChange(highlightIds.filter((h) => h !== id));
    } else {
      onSelectedChange([...selectedIds, id]);
    }
  };

  const toggleHighlight = (id: string) => {
    if (highlightIds.includes(id)) {
      onHighlightChange(highlightIds.filter((h) => h !== id));
    } else {
      if (highlightIds.length >= HIGHLIGHT_SLOTS) {
        toast.error(`Maksimal ${HIGHLIGHT_SLOTS} fasilitas sorotan per kamar`);
        return;
      }
      onHighlightChange([...highlightIds, id]);
    }
  };

  const filtered = allAmenities.filter((am) =>
    am.name.toLowerCase().includes(search.toLowerCase())
  );

  const highlightedAmenities = highlightIds
    .map((id) => allAmenities.find((am) => am.id === id))
    .filter(Boolean) as Amenity[];

  return (
    <div className="space-y-5">
      {/* ── "The Magic 4" Highlight Slots ── */}
      <div className="rounded-2xl border border-[#3A4A1F]/20 bg-gradient-to-b from-[#F6F8F0] to-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#3A4A1F]" />
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#3A4A1F]">
              Highlight Sorotan
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
              highlightIds.length === HIGHLIGHT_SLOTS
                ? "bg-emerald-100 text-emerald-700"
                : "bg-[#3A4A1F]/10 text-[#3A4A1F]/70"
            )}
          >
            {highlightIds.length}/{HIGHLIGHT_SLOTS}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: HIGHLIGHT_SLOTS }).map((_, slotIdx) => {
            const amenity = highlightedAmenities[slotIdx];
            return (
              <div
                key={slotIdx}
                className={cn(
                  "group relative flex min-h-[72px] flex-col items-center justify-center rounded-xl border-2 transition-all duration-200",
                  amenity
                    ? "border-[#3A4A1F] bg-[#3A4A1F] shadow-md shadow-[#3A4A1F]/20"
                    : "border-dashed border-slate-200 bg-slate-50 hover:border-[#3A4A1F]/30"
                )}
              >
                {amenity ? (
                  <>
                    <div className="mb-1 flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                      <Star className="h-3.5 w-3.5 fill-white text-white" />
                    </div>
                    <p className="px-1 text-center text-[9px] font-bold leading-tight text-white">
                      {amenity.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleHighlight(amenity.id)}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                    >
                      <PinOff className="h-2.5 w-2.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200">
                      <Pin className="h-3 w-3 text-slate-400" />
                    </div>
                    <p className="mt-1 text-[9px] font-semibold text-slate-400">
                      Slot {slotIdx + 1}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Mini preview label */}
        <p className="mt-2 text-[10px] text-slate-400">
          Tampil sebagai ikon di kartu villa publik — klik ikon{" "}
          <Pin className="inline h-3 w-3" /> di bawah untuk pin
        </p>
      </div>

      {/* ── Full Amenity Grid ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Semua Fasilitas
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {selectedIds.length} dipilih
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari fasilitas..."
            className="h-9 rounded-xl border-slate-200 bg-slate-50 pl-8 text-xs"
          />
        </div>

        {/* Amenity Chips Grid */}
        <div className="flex flex-wrap gap-2">
          {filtered.map((am) => {
            const isSelected = selectedIds.includes(am.id);
            const isHighlighted = highlightIds.includes(am.id);
            const highlightSlot = highlightIds.indexOf(am.id);

            return (
              <div key={am.id} className="group relative">
                <button
                  type="button"
                  onClick={() => toggleSelected(am.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 pr-8 text-xs font-semibold transition-all",
                    isSelected
                      ? isHighlighted
                        ? "border-[#3A4A1F] bg-[#3A4A1F] text-white shadow-sm"
                        : "border-[#3A4A1F]/40 bg-[#F6F8F0] text-[#3A4A1F]"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  {isSelected && !isHighlighted && (
                    <Check className="h-3 w-3" />
                  )}
                  {isHighlighted && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[8px] font-black">
                      {highlightSlot + 1}
                    </span>
                  )}
                  {am.name}
                </button>

                {/* Pin button — only shown when amenity is selected */}
                {isSelected && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleHighlight(am.id);
                    }}
                    title={isHighlighted ? "Lepas dari highlight" : "Pin sebagai highlight"}
                    className={cn(
                      "absolute right-1.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full transition-all",
                      isHighlighted
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-[#3A4A1F]/10 hover:text-[#3A4A1F]"
                    )}
                  >
                    <Pin className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-400 py-4">
            Tidak ada fasilitas yang cocok
          </p>
        )}
      </div>
    </div>
  );
}

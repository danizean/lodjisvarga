"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Check,
  Pin,
  PinOff,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { LucideDynamicIcon } from "@/components/shared/LucideDynamicIcon";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Amenity {
  id: string;
  name: string;
  icon_name?: string | null;
}

export interface AmenityHighlightManagerProps {
  /** All available amenities across the whole catalog */
  allAmenities: Amenity[];
  /** Amenities that belong to this room (already filtered) */
  roomAmenities: Amenity[];
  /** IDs currently selected (checked) for this room */
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  /** IDs pinned as highlights (ordered, max 4) */
  highlightIds: string[];
  onHighlightChange: (ids: string[]) => void;
  /** Optional room name shown in live preview */
  roomName?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const HIGHLIGHT_SLOTS = 4;

// ── Animation Variants ────────────────────────────────────────────────────────

import { type Variants } from "framer-motion";

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
  exit: { opacity: 0, scale: 0.88, y: -4, transition: { duration: 0.15 } },
};

const slotVariants = {
  empty: { scale: 1, backgroundColor: "transparent" },
  filled: { scale: 1, backgroundColor: "transparent" },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Single amenity icon grid card */
function AmenityCard({
  amenity,
  isSelected,
  isHighlighted,
  highlightSlot,
  onToggleSelect,
  onToggleHighlight,
  isHighlightFull,
}: {
  amenity: Amenity;
  isSelected: boolean;
  isHighlighted: boolean;
  highlightSlot: number; // -1 when not highlighted
  onToggleSelect: () => void;
  onToggleHighlight: () => void;
  isHighlightFull: boolean;
}) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 cursor-pointer select-none transition-colors duration-200",
        isHighlighted
          ? "border-[#3A4A1F] bg-[#3A4A1F] shadow-md shadow-[#3A4A1F]/20"
          : isSelected
          ? "border-[#3A4A1F]/40 bg-[#F6F8F0] hover:border-[#3A4A1F]/70"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
      )}
      onClick={onToggleSelect}
      role="checkbox"
      aria-checked={isSelected}
      aria-label={amenity.name}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onToggleSelect(); } }}
    >
      {/* ── Selection tick (top-left) ── */}
      <AnimatePresence>
        {isSelected && !isHighlighted && (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#3A4A1F]/15"
          >
            <Check className="h-2.5 w-2.5 text-[#3A4A1F]" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* ── Highlight slot badge (top-left when highlighted) ── */}
      <AnimatePresence>
        {isHighlighted && (
          <motion.span
            key="slot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[8px] font-black text-white"
          >
            {highlightSlot + 1}
          </motion.span>
        )}
      </AnimatePresence>

      {/* ── Icon ── */}
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200",
          isHighlighted
            ? "bg-white/20 text-white"
            : isSelected
            ? "bg-[#3A4A1F]/10 text-[#3A4A1F]"
            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600"
        )}
        aria-hidden="true"
      >
        <LucideDynamicIcon
          iconName={amenity.icon_name}
          amenityName={amenity.name}
          className="h-4 w-4"
        />
      </span>

      {/* ── Name ── */}
      <p
        className={cn(
          "text-center text-[9px] font-bold leading-tight",
          isHighlighted ? "text-white" : isSelected ? "text-[#3A4A1F]" : "text-slate-500"
        )}
      >
        {amenity.name}
      </p>

      {/* ── Pin/Unpin star button (top-right) ── */}
      {isSelected && (
        <button
          type="button"
          aria-label={isHighlighted ? `Lepas ${amenity.name} dari highlight` : `Pin ${amenity.name} sebagai highlight`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleHighlight();
          }}
          title={isHighlighted ? "Lepas dari highlight" : "Pin sebagai highlight"}
          className={cn(
            "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-all duration-150",
            isHighlighted
              ? "bg-amber-400 text-white opacity-100"
              : "bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-amber-400 hover:text-white"
          )}
        >
          {isHighlighted ? (
            <Star className="h-2.5 w-2.5 fill-current" />
          ) : (
            <Pin className="h-2.5 w-2.5" />
          )}
        </button>
      )}

      {/* Disabled veil when highlights are full and this isn't highlighted */}
      {!isHighlighted && isHighlightFull && isSelected && (
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-amber-200/60" />
      )}
    </motion.div>
  );
}

/** One highlight slot in the slots row */
function HighlightSlot({
  slot,
  amenity,
  onRemove,
}: {
  slot: number;
  amenity?: Amenity;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      className={cn(
        "group relative flex min-h-[80px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 transition-all duration-200",
        amenity
          ? "border-[#3A4A1F] bg-[#3A4A1F] shadow-md shadow-[#3A4A1F]/20"
          : "border-dashed border-slate-200 bg-slate-50 hover:border-[#3A4A1F]/30"
      )}
    >
      <AnimatePresence mode="wait">
        {amenity ? (
          <motion.div
            key={amenity.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center gap-1.5 px-1"
          >
            {/* Slot number badge */}
            <span className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/25 text-[8px] font-black text-white">
              {slot + 1}
            </span>

            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
              <LucideDynamicIcon
                iconName={amenity.icon_name}
                amenityName={amenity.name}
                className="h-4 w-4 text-white"
              />
            </span>
            <p className="text-center text-[9px] font-bold leading-tight text-white">
              {amenity.name}
            </p>

            {/* Remove button */}
            <button
              type="button"
              aria-label={`Lepas ${amenity.name}`}
              onClick={onRemove}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200">
              <PinOff className="h-3 w-3 text-slate-400" />
            </span>
            <p className="text-[9px] font-semibold text-slate-400">Slot {slot + 1}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Mock mobile villa card preview — mirrors VillaUnitCard's HighlightChip row */
function LivePreview({
  roomName,
  highlights,
}: {
  roomName: string;
  highlights: Amenity[];
}) {
  return (
    <div className="sticky top-6">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-[#3A4A1F]" />
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3A4A1F]">
          Live Preview
        </p>
      </div>

      {/* Mocked card shell */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Faux image placeholder */}
        <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <span className="text-[10px] font-semibold text-slate-400">Foto kamar</span>
          <span className="absolute bottom-2 right-2 rounded-full bg-black/40 px-2 py-0.5 text-[9px] text-white">
            1 / 3
          </span>
        </div>

        {/* Card body */}
        <div className="p-3.5 space-y-2.5">
          {/* Room name */}
          <div>
            <p className="text-sm font-black text-slate-900 truncate">
              {roomName || "Nama Tipe Kamar"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
              <BedDouble className="h-3 w-3 text-[#3A4A1F]" />
              1 King Bed
            </p>
          </div>

          {/* Highlight chips */}
          <div>
            <p className="mb-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">
              Unggulan
            </p>

            <AnimatePresence mode="popLayout">
              {highlights.length === 0 ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] italic text-slate-400"
                >
                  Belum ada highlight dipilih
                </motion.p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {highlights.map((a) => (
                    <motion.span
                      key={a.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#3A4A1F]/6 px-2.5 py-1.5 text-[10px] font-semibold text-[#3A4A1F]"
                    >
                      <LucideDynamicIcon
                        iconName={a.icon_name}
                        amenityName={a.name}
                        className="h-3 w-3 flex-shrink-0 text-[#3A4A1F]"
                      />
                      {a.name}
                    </motion.span>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Faux price row */}
          <div className="rounded-xl bg-slate-50 p-2 flex items-center justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Mulai dari</p>
              <p className="text-base font-black text-[#3A4A1F]">Rp X.XXX.XXX</p>
            </div>
            <div className="rounded-xl bg-[#25D366]/10 px-3 py-1.5 text-[10px] font-bold text-[#1da050]">
              Pesan
            </div>
          </div>
        </div>
      </div>

      {/* Slot counter below preview */}
      <p className="mt-3 text-center text-[10px] text-slate-400">
        {highlights.length}/{HIGHLIGHT_SLOTS} highlight terisi
      </p>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────

export function AmenityHighlightManager({
  allAmenities,
  roomAmenities: _roomAmenities, // kept for API compat, unused internally
  selectedIds,
  onSelectedChange,
  highlightIds,
  onHighlightChange,
  roomName = "",
}: AmenityHighlightManagerProps) {
  const [search, setSearch] = useState("");

  // Track insertion order for FIFO using a ref (avoids stale closure issues)
  const fifoQueueRef = useRef<string[]>(highlightIds);

  // Keep fifoQueue in sync with external changes (parent resets etc.)
  // We use useMemo to derive the ordered list from highlightIds directly
  const highlightedAmenities = useMemo(
    () =>
      highlightIds
        .map((id) => allAmenities.find((a) => a.id === id))
        .filter(Boolean) as Amenity[],
    [highlightIds, allAmenities]
  );

  const filtered = useMemo(
    () =>
      allAmenities.filter((am) =>
        am.name.toLowerCase().includes(search.toLowerCase())
      ),
    [allAmenities, search]
  );

  const isFull = highlightIds.length >= HIGHLIGHT_SLOTS;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleSelected = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        // Deselect — also remove from highlights
        onSelectedChange(selectedIds.filter((x) => x !== id));
        const nextHighlights = highlightIds.filter((h) => h !== id);
        fifoQueueRef.current = nextHighlights;
        onHighlightChange(nextHighlights);
      } else {
        onSelectedChange([...selectedIds, id]);
      }
    },
    [selectedIds, highlightIds, onSelectedChange, onHighlightChange]
  );

  const toggleHighlight = useCallback(
    (id: string) => {
      if (highlightIds.includes(id)) {
        // Un-pin
        const next = highlightIds.filter((h) => h !== id);
        fifoQueueRef.current = next;
        onHighlightChange(next);
        return;
      }

      if (highlightIds.length < HIGHLIGHT_SLOTS) {
        // Add normally
        const next = [...highlightIds, id];
        fifoQueueRef.current = next;
        onHighlightChange(next);
        return;
      }

      // FIFO: remove oldest (index 0), append new
      const queue = fifoQueueRef.current;
      const removedId = queue[0];
      const removedName = allAmenities.find((a) => a.id === removedId)?.name ?? "Highlight";
      const next = [...queue.slice(1), id];
      fifoQueueRef.current = next;
      onHighlightChange(next);

      toast.warning("Maksimal 4 highlights.", {
        description: `"${removedName}" diganti otomatis.`,
      });
    },
    [highlightIds, allAmenities, onHighlightChange]
  );

  const removeHighlight = useCallback(
    (id: string) => {
      const next = highlightIds.filter((h) => h !== id);
      fifoQueueRef.current = next;
      onHighlightChange(next);
    },
    [highlightIds, onHighlightChange]
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px] lg:items-start">

      {/* ════════════ LEFT: Picker ════════════ */}
      <div className="space-y-5">

        {/* ── "The Magic 4" Slots ── */}
        <div className="rounded-2xl border border-[#3A4A1F]/15 bg-gradient-to-b from-[#F6F8F0] to-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#3A4A1F]" />
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3A4A1F]">
                Highlight Sorotan
              </p>
            </div>
            <motion.span
              layout
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-black transition-colors",
                isFull
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-[#3A4A1F]/10 text-[#3A4A1F]/70"
              )}
            >
              {highlightIds.length}/{HIGHLIGHT_SLOTS}
            </motion.span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: HIGHLIGHT_SLOTS }).map((_, slotIdx) => (
              <HighlightSlot
                key={slotIdx}
                slot={slotIdx}
                amenity={highlightedAmenities[slotIdx]}
                onRemove={() =>
                  highlightedAmenities[slotIdx] &&
                  removeHighlight(highlightedAmenities[slotIdx].id)
                }
              />
            ))}
          </div>

          <p className="mt-2.5 text-[10px] text-slate-400">
            Klik ikon{" "}
            <Star className="inline h-3 w-3 text-amber-400 fill-amber-400" />{" "}
            di kartu fasilitas untuk pin. Maks 4 — overflow diganti otomatis (FIFO).
          </p>
        </div>

        {/* ── All Amenities Grid ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
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

          {/* Icon grid */}
          <motion.div
            layout
            className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5"
          >
            <AnimatePresence>
              {filtered.map((am) => {
                const isSelected = selectedIds.includes(am.id);
                const isHighlighted = highlightIds.includes(am.id);
                const highlightSlot = highlightIds.indexOf(am.id);

                return (
                  <AmenityCard
                    key={am.id}
                    amenity={am}
                    isSelected={isSelected}
                    isHighlighted={isHighlighted}
                    highlightSlot={highlightSlot}
                    isHighlightFull={isFull}
                    onToggleSelect={() => toggleSelected(am.id)}
                    onToggleHighlight={() => toggleHighlight(am.id)}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400">
              Tidak ada fasilitas yang cocok dengan &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* ════════════ RIGHT: Live Preview Panel ════════════ */}
      <div className="lg:block">
        <LivePreview roomName={roomName} highlights={highlightedAmenities} />
      </div>

    </div>
  );
}

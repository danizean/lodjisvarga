"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Star,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmenityHighlightManager } from "@/components/admin/villas/AmenityHighlightManager";
import { GalleryUploader, type GalleryItem } from "@/components/admin/GalleryUploader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { cn } from "@/lib/utils";

export interface RoomTypeForm {
  id?: string;
  name: string;
  base_price: number;
  bed_type?: string;
  description: string;
  amenity_ids: string[];
  highlight_amenity_ids: string[];
  gallery: GalleryItem[];
}

interface AmenityMeta {
  id: string;
  name: string;
  icon_name?: string | null;
}

interface RoomEditorPanelProps {
  room: RoomTypeForm;
  idx: number;
  villaId: string;
  isCreate: boolean;
  allAmenities: AmenityMeta[];
  onFieldChange: <K extends keyof RoomTypeForm>(key: K, value: RoomTypeForm[K]) => void;
  onRemove: () => void;
  onUploadStatusChange: (uploading: boolean) => void;
}

export function RoomEditorPanel({
  room,
  idx,
  villaId,
  isCreate,
  allAmenities,
  onFieldChange,
  onRemove,
  onUploadStatusChange,
}: RoomEditorPanelProps) {
  const [expanded, setExpanded] = useState(idx === 0);
  const [activeTab, setActiveTab] = useState<"details" | "amenities" | "gallery">("details");

  const primaryPhoto = room.gallery.find((g) => g.is_primary) ?? room.gallery[0];
  const highlightNames = room.highlight_amenity_ids
    .map((id) => allAmenities.find((a) => a.id === id)?.name)
    .filter(Boolean) as string[];

  const TABS = [
    { id: "details" as const, label: "Detail" },
    { id: "amenities" as const, label: `Fasilitas (${room.amenity_ids.length})` },
    { id: "gallery" as const, label: `Galeri (${room.gallery.length})` },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border transition-all duration-300",
        expanded
          ? "border-[#3A4A1F]/20 bg-white shadow-md shadow-[#3A4A1F]/5"
          : "border-slate-200 bg-white shadow-sm"
      )}
    >
      {/* ── Card Header (always visible) ── */}
      <div
        className={cn(
          "flex cursor-pointer items-center gap-4 p-4 transition-colors",
          expanded ? "border-b border-slate-100 bg-slate-50/60" : "hover:bg-slate-50"
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Thumbnail */}
        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.image_url}
              alt={room.name || "Room"}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-6 w-6 text-slate-300" />
            </div>
          )}
          {room.gallery.length > 0 && (
            <div className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1 py-0.5 text-[8px] font-bold text-white">
              {room.gallery.length}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#3A4A1F]/10 text-[10px] font-black text-[#3A4A1F]">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <p className="truncate text-sm font-black text-slate-900">
              {room.name || <span className="italic text-slate-400">Tanpa nama</span>}
            </p>
            {room.id && <StatusBadge status="active" variant="room" />}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {room.bed_type && (
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                <BedDouble className="h-3 w-3" />
                {room.bed_type}
              </span>
            )}
            {/* Highlight pills */}
            {highlightNames.slice(0, 3).map((name) => (
              <span
                key={name}
                className="flex items-center gap-1 rounded-full bg-[#3A4A1F]/8 px-2 py-0.5 text-[10px] font-semibold text-[#3A4A1F]"
              >
                <Star className="h-2.5 w-2.5 fill-[#3A4A1F]" />
                {name}
              </span>
            ))}
            {/* Missing highlights badge */}
            {room.highlight_amenity_ids.length < 4 && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-200">
                {room.highlight_amenity_ids.length}/4 Highlights
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex shrink-0 items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <AlertDialog>
            <AlertDialogTrigger
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 text-red-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus tipe kamar ini?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{room.name || "Tanpa nama"}&rdquo; akan dihapus dari form. Jika sudah pernah
                  disimpan, sistem akan mengarsipkannya agar histori tetap aman.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={onRemove} className="bg-red-600 hover:bg-red-700">
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* ── Expanded Content ── */}
      {expanded && (
        <div>
          {/* Tab bar */}
          <div className="flex border-b border-slate-100 bg-white px-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "mr-1 border-b-2 px-3 py-2.5 text-xs font-bold transition-colors",
                  activeTab === tab.id
                    ? "border-[#3A4A1F] text-[#3A4A1F]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ── Tab: Detail ── */}
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Nama Tipe Kamar
                    </label>
                    <Input
                      value={room.name}
                      onChange={(e) => onFieldChange("name", e.target.value)}
                      placeholder="Contoh: Joglo Suite"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Tipe Tempat Tidur
                    </label>
                    <Input
                      value={room.bed_type ?? ""}
                      onChange={(e) => onFieldChange("bed_type", e.target.value)}
                      placeholder="Contoh: 1 King Bed"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Deskripsi Kamar
                  </label>
                  <textarea
                    rows={4}
                    value={room.description}
                    onChange={(e) => onFieldChange("description", e.target.value)}
                    placeholder="Deskripsikan suasana, ukuran, view, dan fasilitas unggulannya..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#3A4A1F]/30 focus:ring-0"
                  />
                </div>

                {/* Calendar link */}
                <div className="flex items-center gap-3 rounded-2xl border border-[#3A4A1F]/10 bg-[#F6F8F0] p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3A4A1F]/10">
                    <CalendarDays className="h-4 w-4 text-[#3A4A1F]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800">Harga & Ketersediaan</p>
                    <p className="text-[10px] text-slate-500">
                      Rate harian dikelola di Calendar Workspace
                    </p>
                  </div>
                  {!isCreate && room.id ? (
                    <Link href="/admin/calendar">
                      <Button
                        variant="outline"
                        className="h-8 shrink-0 rounded-xl border-[#3A4A1F]/20 text-[10px] font-bold text-[#3A4A1F]"
                      >
                        Buka
                      </Button>
                    </Link>
                  ) : (
                    <span className="shrink-0 rounded-xl bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                      Simpan dulu
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab: Amenities ── */}
            {activeTab === "amenities" && (
              <AmenityHighlightManager
                allAmenities={allAmenities}
                roomAmenities={allAmenities.filter((a) => room.amenity_ids.includes(a.id))}
                selectedIds={room.amenity_ids}
                onSelectedChange={(ids) => {
                  onFieldChange("amenity_ids", ids);
                  const nextHighlights = room.highlight_amenity_ids.filter((hid) =>
                    ids.includes(hid)
                  );
                  onFieldChange("highlight_amenity_ids", nextHighlights);
                }}
                highlightIds={room.highlight_amenity_ids}
                onHighlightChange={(ids) => onFieldChange("highlight_amenity_ids", ids)}
              />
            )}

            {/* ── Tab: Gallery ── */}
            {activeTab === "gallery" && (
              <GalleryUploader
                villaId={villaId}
                roomTypeId={room.id}
                items={room.gallery}
                onChange={(items) => onFieldChange("gallery", items)}
                onUploadStatusChange={onUploadStatusChange}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

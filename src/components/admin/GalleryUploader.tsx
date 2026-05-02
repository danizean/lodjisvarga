"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useUpload } from "@/hooks/use-upload";
import {
  Crown,
  GripVertical,
  ImageOff,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  id?: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface GalleryUploaderProps {
  villaId: string;
  roomTypeId?: string;
  items: GalleryItem[];
  onChange: (items: GalleryItem[]) => Promise<void> | void;
  onUploadStatusChange?: (isUploading: boolean) => void;
  compact?: boolean;
}

export function GalleryUploader({
  villaId,
  roomTypeId,
  items,
  onChange,
  onUploadStatusChange,
  compact = false,
}: GalleryUploaderProps) {
  const { uploadFiles, deleteFiles, isUploading, uploadProgress } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      toast.error("Pilih file gambar (JPG/PNG/WEBP)");
      return;
    }

    try {
      onUploadStatusChange?.(true);
      const results = await uploadFiles(fileArray, villaId, roomTypeId);
      const newItems: GalleryItem[] = results.map((r, i) => ({
        image_url: r.publicUrl,
        is_primary: items.length === 0 && i === 0,
        display_order: items.length + i,
      }));
      
      try {
        await onChange([...items, ...newItems]);
        toast.success(`${results.length} foto berhasil diunggah`);
      } catch (dbError) {
        console.error("DB Save Error:", dbError);
        await deleteFiles(results.map(r => r.publicUrl));
        toast.error("Gagal menyimpan foto kamar. Silakan coba lagi.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload gagal";
      toast.error(message);
    } finally {
      onUploadStatusChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setPrimary = async (url: string) => {
    try {
      await onChange(items.map((item) => ({ ...item, is_primary: item.image_url === url })));
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengubah foto utama.");
    }
  };

  const removeItem = async (url: string) => {
    const filtered = items.filter((i) => i.image_url !== url);
    if (filtered.length > 0 && !filtered.some((i) => i.is_primary)) {
      filtered[0].is_primary = true;
    }
    try {
      await onChange(filtered.map((item, idx) => ({ ...item, display_order: idx })));
      await deleteFiles([url]);
    } catch (dbError) {
      console.error("DB Delete Error:", dbError);
      toast.error("Gagal menghapus foto kamar.");
    }
  };

  // ── Drag-to-reorder handlers ──
  const handleDragStart = useCallback((idx: number) => {
    setDraggedIdx(idx);
  }, []);

  const handleDragEnterItem = useCallback((idx: number) => {
    setDragOverIdx(idx);
  }, []);

  const handleDropOnItem = useCallback(
    async (idx: number) => {
      if (draggedIdx === null || draggedIdx === idx) {
        setDraggedIdx(null);
        setDragOverIdx(null);
        return;
      }
      const reordered = [...items];
      const [moved] = reordered.splice(draggedIdx, 1);
      reordered.splice(idx, 0, moved);
      try {
        await onChange(reordered.map((item, i) => ({ ...item, display_order: i })));
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengubah urutan foto.");
      }
      setDraggedIdx(null);
      setDragOverIdx(null);
    },
    [draggedIdx, items, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200",
          dragOver
            ? "border-[#3A4A1F] bg-[#F6F8F0]"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/60",
          compact && "p-4"
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#3A4A1F]" />
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Mengunggah foto... {uploadProgress}%
              </p>
              <div className="mx-auto mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#3A4A1F] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className={cn(
                "mx-auto flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                dragOver ? "bg-[#3A4A1F]/10" : "bg-slate-200"
              )}
            >
              <UploadCloud
                className={cn(
                  "h-5 w-5 transition-colors",
                  dragOver ? "text-[#3A4A1F]" : "text-slate-400"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Klik atau seret foto ke sini
              </p>
              <p className="mt-0.5 text-xs text-slate-400">PNG, JPG, WEBP — Maks 5MB/file</p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview Grid with drag-to-reorder */}
      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {items.length} foto — seret untuk ubah urutan
            </p>
          </div>
          <div className={cn("grid gap-2", compact ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4")}>
            {items.map((item, idx) => (
              <div
                key={item.image_url}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnterItem(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnItem(idx)}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className={cn(
                  "group relative aspect-square cursor-grab overflow-hidden rounded-xl border-2 transition-all duration-200 active:cursor-grabbing",
                  item.is_primary
                    ? "border-amber-400 shadow-md shadow-amber-100"
                    : "border-transparent hover:border-slate-200",
                  draggedIdx === idx && "scale-95 opacity-50",
                  dragOverIdx === idx && draggedIdx !== idx
                    ? "border-[#3A4A1F] ring-2 ring-[#3A4A1F]/20"
                    : ""
                )}
              >
                <Image
                  src={item.image_url}
                  alt={`Foto ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />

                {/* Drag handle overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
                  <GripVertical className="h-5 w-5 text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-80" />
                </div>

                {/* Action controls */}
                <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
                  {!item.is_primary && (
                    <button
                      type="button"
                      title="Jadikan foto utama"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPrimary(item.image_url);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-white shadow-sm transition-colors hover:bg-amber-500"
                    >
                      <Star className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Hapus foto"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.image_url);
                    }}
                    className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Primary badge */}
                {item.is_primary && (
                  <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-amber-400 px-1.5 py-0.5 text-white shadow-sm">
                    <Crown className="h-2.5 w-2.5 fill-white" />
                    <span className="text-[8px] font-black uppercase">Utama</span>
                  </div>
                )}

                {/* Order badge */}
                <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {idx + 1}
                </div>
              </div>
            ))}

            {/* Empty placeholder when no items */}
            {items.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-slate-400">
                <ImageOff className="h-8 w-8" />
                <p className="text-xs font-semibold">Belum ada foto</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

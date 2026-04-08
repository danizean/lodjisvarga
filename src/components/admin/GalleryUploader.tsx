"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useUpload } from "@/hooks/use-upload";
import { Loader2, StarIcon, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

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
  onChange: (items: GalleryItem[]) => void;
  onUploadStatusChange?: (isUploading: boolean) => void;
}

export function GalleryUploader({
  villaId,
  roomTypeId,
  items,
  onChange,
  onUploadStatusChange,
}: GalleryUploaderProps) {
  const { uploadFiles, isUploading, uploadProgress } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArray.length === 0) { toast.error("Pilih file gambar (JPG/PNG/WEBP)"); return; }

    try {
      onUploadStatusChange?.(true);
      const results = await uploadFiles(fileArray, villaId, roomTypeId);
      const newItems: GalleryItem[] = results.map((r, i) => ({
        image_url: r.publicUrl,
        is_primary: items.length === 0 && i === 0,
        display_order: items.length + i,
      }));
      onChange([...items, ...newItems]);
      toast.success(`${results.length} foto berhasil diupload`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload gagal";
      toast.error(message);
    } finally {
      onUploadStatusChange?.(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setPrimary = (url: string) => {
    onChange(items.map(item => ({ ...item, is_primary: item.image_url === url })));
  };

  const removeItem = (url: string) => {
    const filtered = items.filter(i => i.image_url !== url);
    // Ensure there's always a primary if items remain
    if (filtered.length > 0 && !filtered.some(i => i.is_primary)) {
      filtered[0].is_primary = true;
    }
    onChange(filtered.map((item, idx) => ({ ...item, display_order: idx })));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">
          {isUploading ? `Mengupload... ${uploadProgress}%` : "Klik atau seret foto ke sini"}
        </p>
        <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP — Maks 5MB per file</p>
        {isUploading && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div
              key={item.image_url}
              className={`relative aspect-[4/3] rounded-xl overflow-hidden group border-2 transition-all ${
                item.is_primary ? "border-emerald-500 shadow-md shadow-emerald-100" : "border-transparent"
              }`}
            >
              <Image src={item.image_url} alt="Gallery" fill className="object-cover" />

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!item.is_primary && (
                  <button
                    type="button"
                    title="Jadikan foto utama"
                    onClick={() => setPrimary(item.image_url)}
                    className="p-1.5 bg-emerald-500 rounded-lg text-white hover:bg-emerald-600 transition-colors"
                  >
                    <StarIcon className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title="Hapus foto"
                  onClick={() => removeItem(item.image_url)}
                  className="p-1.5 bg-red-500 rounded-lg text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Primary badge */}
              {item.is_primary && (
                <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <StarIcon className="w-2.5 h-2.5 fill-white" /> UTAMA
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

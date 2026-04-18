"use client";

import { useCallback, useRef, useState } from "react";
import {
  ImagePlus, X, Loader2, AlertCircle, CheckCircle2, Upload,
} from "lucide-react";
import {
  uploadBlogThumbnail,
  validateImageFile,
  BLOG_THUMBNAIL_CONFIG,
} from "@/lib/utils/upload";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ThumbnailUploaderProps {
  /** Current value (URL already stored in DB) */
  value: string;
  /** Called with the new public URL after a successful upload */
  onChange: (url: string) => void;
  /** Called with true when upload starts, false when it ends */
  onUploadingChange?: (isUploading: boolean) => void;
  /** Additional wrapper class */
  className?: string;
}

type UploadState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "uploading"; progress: number }
  | { status: "success" }
  | { status: "error"; message: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ThumbnailUploader({ value, onChange, onUploadingChange, className = "" }: ThumbnailUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [preview, setPreview] = useState<string>(value); // optimistic local preview

  // Sync external value changes (e.g. form reset)
  const externalValue = value;
  if (externalValue !== preview && uploadState.status === "idle") {
    setPreview(externalValue);
  }

  const isUploading = uploadState.status === "uploading" || uploadState.status === "validating";

  // ── Upload handler ──
  const handleFile = useCallback(
    async (file: File) => {
      // 1. Validate
      const validationError = validateImageFile(file);
      if (validationError) {
        setUploadState({ status: "error", message: validationError.message });
        return;
      }

      // 2. Optimistic local preview (instant)
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      setUploadState({ status: "uploading", progress: 0 });
      onUploadingChange?.(true);

      try {
        // 3. Get current user for folder path
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Silakan login ulang untuk mengunggah gambar.");

        // 4. Simulate progress (Supabase JS SDK doesn't expose byte progress)
        const progressInterval = setInterval(() => {
          setUploadState((prev) =>
            prev.status === "uploading" && prev.progress < 85
              ? { status: "uploading", progress: prev.progress + 15 }
              : prev
          );
        }, 200);

        // 5. Upload
        const { publicUrl } = await uploadBlogThumbnail(file, user.id);
        clearInterval(progressInterval);

        // 6. Done
        setUploadState({ status: "success" });
        setPreview(publicUrl);
        onChange(publicUrl);
        onUploadingChange?.(false);

        // Revoke blob URL
        URL.revokeObjectURL(localUrl);

        // Auto-clear success state after 2s
        setTimeout(() => setUploadState({ status: "idle" }), 2000);

      } catch (err) {
        URL.revokeObjectURL(localUrl);
        setPreview(value); // revert to previous
        onUploadingChange?.(false);
        setUploadState({
          status: "error",
          message: err instanceof Error ? err.message : "Upload gagal. Coba lagi.",
        });
      }
    },
    [onChange, value]
  );

  // ── Drop handler ──
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // ── Clear ──
  const handleClear = () => {
    setPreview("");
    onChange("");
    setUploadState({ status: "idle" });
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Progress bar width ──
  const progressWidth =
    uploadState.status === "uploading" ? `${uploadState.progress}%`
    : uploadState.status === "success" ? "100%"
    : "0%";

  return (
    <div className={`space-y-2 ${className}`}>

      {/* ── Drop zone / preview area ── */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          relative w-full rounded-xl border-2 overflow-hidden transition-all duration-200
          ${isUploading ? "border-[#3A4A1F]/50 bg-[#3A4A1F]/5" : ""}
          ${!preview && !isUploading ? "border-dashed border-slate-200 bg-slate-50 hover:border-[#3A4A1F]/40 hover:bg-[#3A4A1F]/5 cursor-pointer" : ""}
          ${preview && !isUploading ? "border-slate-100" : ""}
        `}
        onClick={() => !preview && !isUploading && fileRef.current?.click()}
        role={!preview ? "button" : undefined}
        tabIndex={!preview ? 0 : undefined}
        onKeyDown={(e) => {
          if (!preview && (e.key === "Enter" || e.key === " ")) fileRef.current?.click();
        }}
        aria-label={preview ? "Thumbnail area" : "Klik atau drop gambar untuk upload"}
      >
        {/* ── Empty state ── */}
        {!preview && !isUploading && (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="h-12 w-12 rounded-full bg-[#3A4A1F]/10 flex items-center justify-center mb-3">
              <ImagePlus className="w-5 h-5 text-[#3A4A1F]" />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Klik atau drop gambar di sini
            </p>
            <p className="text-xs text-slate-400 mt-1">
              JPG, PNG, WebP · Maks. 2 MB
            </p>
          </div>
        )}

        {/* ── Image preview ── */}
        {preview && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Thumbnail preview"
              className={`w-full aspect-video object-cover transition-all duration-300 ${isUploading ? "opacity-50 blur-[1px]" : "opacity-100"}`}
            />

            {/* Remove button (top-right) */}
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClear(); }}
                className="absolute top-2 right-2 h-7 w-7 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                aria-label="Hapus thumbnail"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Change button (bottom-left) */}
            {!isUploading && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 text-white text-[10px] font-bold hover:bg-black/80 transition"
              >
                <Upload className="w-3 h-3" />
                Ganti Gambar
              </button>
            )}
          </>
        )}

        {/* ── Upload overlay spinner ── */}
        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
            <Loader2 className="w-8 h-8 text-[#3A4A1F] animate-spin" />
            <p className="text-xs font-bold text-[#3A4A1F]">Mengungah gambar…</p>
          </div>
        )}
      </div>

      {/* ── Progress bar ── */}
      {(uploadState.status === "uploading" || uploadState.status === "success") && (
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              uploadState.status === "success" ? "bg-emerald-500" : "bg-[#3A4A1F]"
            }`}
            style={{ width: progressWidth }}
          />
        </div>
      )}

      {/* ── Status messages ── */}
      {uploadState.status === "error" && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {uploadState.message}
        </p>
      )}

      {uploadState.status === "success" && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          Gambar berhasil diunggah
        </p>
      )}

      {/* ── Hidden file input ── */}
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept={BLOG_THUMBNAIL_CONFIG.acceptString}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // reset so same file can be re-selected
          e.target.value = "";
        }}
      />
    </div>
  );
}

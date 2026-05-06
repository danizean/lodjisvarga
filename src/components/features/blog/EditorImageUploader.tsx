"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Editor } from "@tiptap/react";
import {
  ImagePlus, Link2, Upload, X, Loader2,
  AlertCircle, CheckCircle2, ImageIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  uploadBlogContentImage,
  validateContentImageFile,
  BLOG_CONTENT_IMAGE_CONFIG,
} from "@/lib/utils/upload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditorImageUploaderProps {
  editor: Editor;
}

type Tab = "upload" | "url";

type UploadStatus =
  | { phase: "idle" }
  | { phase: "uploading"; progress: number }
  | { phase: "success" }
  | { phase: "error"; message: string };

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorImageUploader({ editor }: EditorImageUploaderProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("upload");
  const [urlValue, setUrlValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ phase: "idle" });

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // ── Close on outside click or Escape ──
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  // Focus URL input when switching to URL tab
  useEffect(() => {
    if (open && tab === "url") {
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [open, tab]);

  // Reset state when panel closes
  function handleClose() {
    setOpen(false);
    setUrlValue("");
    setUploadStatus({ phase: "idle" });
    setIsDragging(false);
  }

  function handleToggle() {
    if (open) {
      handleClose();
    } else {
      setOpen(true);
      setTab("upload");
    }
  }

  // ── Insert image into editor ──
  function insertImage(url: string, alt?: string) {
    if (!url.trim()) return;
    editor.chain().focus().setImage({ src: url.trim(), alt: alt ?? "" }).run();
    handleClose();
  }

  // ── URL tab submit ──
  function handleUrlInsert() {
    if (!urlValue.trim()) return;
    insertImage(urlValue.trim());
  }

  // ── File upload ──
  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateContentImageFile(file);
      if (validationError) {
        setUploadStatus({ phase: "error", message: validationError.message });
        return;
      }

      setUploadStatus({ phase: "uploading", progress: 0 });

      // Simulated progress ticker (Supabase SDK has no byte progress)
      const ticker = setInterval(() => {
        setUploadStatus((prev) =>
          prev.phase === "uploading" && prev.progress < 85
            ? { phase: "uploading", progress: prev.progress + 20 }
            : prev
        );
      }, 180);

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Silakan login ulang untuk mengunggah gambar.");

        const { publicUrl } = await uploadBlogContentImage(file, user.id);
        clearInterval(ticker);
        setUploadStatus({ phase: "success" });

        // Short success flash, then insert + close
        setTimeout(() => {
          insertImage(publicUrl, file.name.replace(/\.[^.]+$/, ""));
        }, 400);
      } catch (err) {
        clearInterval(ticker);
        setUploadStatus({
          phase: "error",
          message: err instanceof Error ? err.message : "Upload gagal. Coba lagi.",
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor]
  );

  // ── Drag handlers ──
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    if (!panelRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  const isUploading = uploadStatus.phase === "uploading";
  const progressWidth =
    uploadStatus.phase === "uploading" ? `${uploadStatus.progress}%`
    : uploadStatus.phase === "success" ? "100%"
    : "0%";

  return (
    <div className="relative">
      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          handleToggle();
        }}
        title="Sisipkan Gambar"
        aria-label="Sisipkan Gambar"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`
          inline-flex items-center justify-center
          w-8 h-8 rounded-lg text-sm
          transition-all duration-150
          ${open
            ? "bg-[#3A4A1F] text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-[#3A4A1F]"
          }
          cursor-pointer
        `}
      >
        <ImagePlus className="w-3.5 h-3.5" />
      </button>

      {/* ── Floating panel ── */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Sisipkan gambar"
          aria-modal="true"
          className="
            absolute z-50 top-full left-0 mt-1.5
            w-[320px] rounded-xl border border-gray-200
            bg-white shadow-xl ring-1 ring-black/5
            overflow-hidden
          "
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* ── Panel header ── */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#FAFAF8]">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#3A4A1F]" />
              Sisipkan Gambar
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-gray-100">
            {(["upload", "url"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5
                  py-2.5 text-[11px] font-bold uppercase tracking-widest
                  transition-all duration-150
                  ${tab === t
                    ? "text-[#3A4A1F] border-b-2 border-[#3A4A1F] -mb-px bg-white"
                    : "text-gray-400 hover:text-gray-600 bg-[#FAFAF8]"
                  }
                `}
              >
                {t === "upload"
                  ? <><Upload className="w-3 h-3" />Unggah File</>
                  : <><Link2 className="w-3 h-3" />URL Gambar</>
                }
              </button>
            ))}
          </div>

          {/* ── Upload tab ── */}
          {tab === "upload" && (
            <div className="p-4 space-y-3">
              {/* Drop zone */}
              <div
                className={`
                  relative flex flex-col items-center justify-center
                  rounded-xl border-2 border-dashed
                  py-8 px-4 text-center cursor-pointer
                  transition-all duration-150
                  ${isDragging
                    ? "border-[#3A4A1F] bg-[#3A4A1F]/5 scale-[0.99]"
                    : isUploading
                    ? "border-[#3A4A1F]/40 bg-[#3A4A1F]/3"
                    : uploadStatus.phase === "success"
                    ? "border-emerald-400 bg-emerald-50"
                    : uploadStatus.phase === "error"
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-[#3A4A1F]/50 hover:bg-[#3A4A1F]/3"
                  }
                `}
                onClick={() => !isUploading && fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !isUploading) {
                    fileRef.current?.click();
                  }
                }}
                aria-label="Klik atau drop gambar untuk diunggah"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-[#3A4A1F] animate-spin mb-2" />
                ) : uploadStatus.phase === "success" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                ) : uploadStatus.phase === "error" ? (
                  <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-300 mb-2" />
                )}

                <p className={`text-xs font-semibold ${
                  isUploading ? "text-[#3A4A1F]"
                  : uploadStatus.phase === "success" ? "text-emerald-600"
                  : uploadStatus.phase === "error" ? "text-red-500"
                  : "text-gray-500"
                }`}>
                  {isUploading
                    ? "Mengunggah gambar…"
                    : uploadStatus.phase === "success"
                    ? "Berhasil! Menyisipkan ke editor…"
                    : uploadStatus.phase === "error"
                    ? uploadStatus.message
                    : isDragging
                    ? "Lepas untuk mengunggah"
                    : "Klik atau seret gambar ke sini"
                  }
                </p>
                {uploadStatus.phase === "idle" && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    JPG, PNG, WebP, GIF · Maks. 5 MB
                  </p>
                )}
              </div>

              {/* Progress bar */}
              {(isUploading || uploadStatus.phase === "success") && (
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      uploadStatus.phase === "success" ? "bg-emerald-500" : "bg-[#3A4A1F]"
                    }`}
                    style={{ width: progressWidth }}
                  />
                </div>
              )}

              {/* Retry button on error */}
              {uploadStatus.phase === "error" && (
                <button
                  type="button"
                  onClick={() => setUploadStatus({ phase: "idle" })}
                  className="w-full py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition"
                >
                  Coba Lagi
                </button>
              )}

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept={BLOG_CONTENT_IMAGE_CONFIG.acceptString}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* ── URL tab ── */}
          {tab === "url" && (
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  URL Gambar
                </label>
                <input
                  ref={urlInputRef}
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUrlInsert();
                  }}
                  placeholder="https://example.com/gambar.jpg"
                  className="
                    w-full h-9 px-3 rounded-lg text-xs border border-gray-200
                    bg-white text-gray-900 placeholder:text-gray-300
                    focus:outline-none focus:ring-2 focus:ring-[#3A4A1F]/20 focus:border-[#3A4A1F]/60
                    transition-all
                  "
                />
              </div>
              <button
                type="button"
                onClick={handleUrlInsert}
                disabled={!urlValue.trim()}
                className="
                  w-full h-9 rounded-lg text-xs font-bold
                  bg-[#3A4A1F] text-white
                  hover:bg-[#2A3A10] disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-150
                  flex items-center justify-center gap-1.5
                "
              >
                <ImagePlus className="w-3.5 h-3.5" />
                Sisipkan Gambar
              </button>
              <p className="text-[10px] text-gray-400 text-center">
                Pastikan URL mengarah langsung ke file gambar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

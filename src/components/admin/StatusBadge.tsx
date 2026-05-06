"use client";

import { cn } from "@/lib/utils";

// 1. Definisikan tipe literal untuk meningkatkan Type-Safety
export type BadgeVariant = "villa" | "promo" | "lead" | "room";

interface StatusBadgeProps {
  status: string | boolean | null | undefined;
  variant?: BadgeVariant;
  className?: string;
}

// 2. Konfigurasi Status dengan desain yang lebih konsisten
// Menggunakan Record untuk memastikan konsistensi data
const CONFIGS: Record<BadgeVariant, Record<string, { label: string; class: string }>> = {
  villa: {
    active:      { label: "Aktif",       class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Published:   { label: "Aktif",       class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    coming_soon: { label: "Coming Soon", class: "bg-amber-50 text-amber-700 border-amber-200" },
    inactive:    { label: "Nonaktif",    class: "bg-slate-50 text-slate-600 border-slate-200" },
    Maintenance: { label: "Maintenance", class: "bg-orange-50 text-orange-700 border-orange-200" },
    Hidden:      { label: "Tersembunyi", class: "bg-blue-50 text-blue-700 border-blue-200" },
    Archived:    { label: "Diarsipkan",  class: "bg-red-50 text-red-700 border-red-200" },
  },
  promo: {
    draft:     { label: "Draft",       class: "bg-slate-50 text-slate-500 border-slate-200" },
    active:    { label: "Promo Aktif", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    scheduled: { label: "Dijadwalkan", class: "bg-blue-50 text-blue-700 border-blue-200" },
    expired:   { label: "Kedaluwarsa", class: "bg-orange-50 text-orange-700 border-orange-200" },
    disabled:  { label: "Nonaktif",    class: "bg-red-50 text-red-700 border-red-200" },
  },
  lead: {
    New:       { label: "Baru",        class: "bg-blue-50 text-blue-700 border-blue-200" },
    FollowUp:  { label: "Follow Up",   class: "bg-amber-50 text-amber-700 border-amber-200" },
    Quoted:    { label: "Penawaran",   class: "bg-purple-50 text-purple-700 border-purple-200" },
    Confirmed: { label: "Confirmed",   class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    Cancelled: { label: "Dibatalkan",  class: "bg-red-50 text-red-700 border-red-200" },
    Lost:      { label: "Lost",        class: "bg-slate-50 text-slate-500 border-slate-200" },
  },
  room: {
    active:   { label: "Aktif",       class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    inactive: { label: "Nonaktif",    class: "bg-slate-50 text-slate-500 border-slate-200" },
    maintenance: { label: "Perbaikan", class: "bg-orange-50 text-orange-700 border-orange-200" },
  },
};

/**
 * Komponen StatusBadge untuk menampilkan status dengan warna dan label yang sesuai.
 * Mendukung berbagai varian (villa, promo, lead, room).
 */
export function StatusBadge({ status, variant = "villa", className }: StatusBadgeProps) {
  // Mengonversi status ke string (menangani boolean true/false untuk varian promo)
  const statusKey = String(status ?? "inactive");
  
  // Mencari konfigurasi berdasarkan variant dan status
  const config = CONFIGS[variant]?.[statusKey] ?? {
    label: statusKey,
    class: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={cn(
        // Base classes
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm transition-all",
        // Typography
        "text-[10px] font-black uppercase tracking-[0.12em]",
        // Dynamic classes dari config
        config.class,
        // Override dari luar jika ada
        className
      )}
    >
      {/* Indikator Titik (Dot) */}
      <span className="relative flex h-1.5 w-1.5">
        {/* Efek ping animasi hanya untuk status yang 'aktif' atau 'baru' */}
        {(statusKey === "active" || statusKey === "New" || statusKey === "Published") && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-40"></span>
        )}
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current opacity-80"></span>
      </span>

      {config.label}
    </span>
  );
}
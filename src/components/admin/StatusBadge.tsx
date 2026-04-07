"use client";

interface StatusBadgeProps {
  status: string | null;
  variant?: "villa" | "promo" | "lead" | "room";
}

const CONFIGS: Record<string, Record<string, { label: string; class: string }>> = {
  villa: {
    active:       { label: "Aktif",       class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    coming_soon:  { label: "Coming Soon", class: "bg-amber-100 text-amber-800 border-amber-200" },
    inactive:     { label: "Nonaktif",    class: "bg-red-100 text-red-800 border-red-200" },
    Published:    { label: "Aktif",       class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    Maintenance:  { label: "Maintenance", class: "bg-orange-100 text-orange-800 border-orange-200" },
    Hidden:       { label: "Tersembunyi", class: "bg-slate-100 text-slate-600 border-slate-200" },
    Archived:     { label: "Diarsipkan",  class: "bg-red-100 text-red-700 border-red-200" },
  },
  promo: {
    true:  { label: "Aktif",     class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    false: { label: "Nonaktif",  class: "bg-slate-100 text-slate-500 border-slate-200" },
  },
  lead: {
    New:        { label: "Baru",       class: "bg-blue-100 text-blue-800 border-blue-200" },
    FollowUp:   { label: "Follow Up",  class: "bg-amber-100 text-amber-800 border-amber-200" },
    Quoted:     { label: "Dikutip",    class: "bg-purple-100 text-purple-800 border-purple-200" },
    Confirmed:  { label: "Dikonfirm",  class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    Cancelled:  { label: "Dibatalkan", class: "bg-red-100 text-red-800 border-red-200" },
    Lost:       { label: "Lost",       class: "bg-slate-100 text-slate-500 border-slate-200" },
  },
  room: {
    active:   { label: "Aktif",      class: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    inactive: { label: "Diarsipkan", class: "bg-slate-100 text-slate-500 border-slate-200" },
  },
};

export function StatusBadge({ status, variant = "villa" }: StatusBadgeProps) {
  const statusKey = status ?? "inactive";
  const config = CONFIGS[variant]?.[statusKey] ?? {
    label: statusKey,
    class: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider ${config.class}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60" />
      {config.label}
    </span>
  );
}

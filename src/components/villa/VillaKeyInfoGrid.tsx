import type { LucideIcon } from "lucide-react";

interface KeyInfoItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface VillaKeyInfoGridProps {
  items: KeyInfoItem[];
}

export function VillaKeyInfoGrid({ items }: VillaKeyInfoGridProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-label="Informasi singkat">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Info Utama</p>
        <p className="mt-1.5 text-lg font-black tracking-tight text-slate-950">Informasi Singkat</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-[#3A4A1F]">
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              </div>
              <p className="mt-3 text-sm font-semibold leading-5 text-slate-900">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

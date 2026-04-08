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
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Key Info</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Quick scan sebelum booking</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.slice(0, 4).map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2 text-[#3A4A1F]">
                <Icon className="h-4 w-4" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-900">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

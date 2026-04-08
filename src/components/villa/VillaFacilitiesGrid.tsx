import { CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface VillaFacilitiesGridProps {
  facilities: string[];
}

export function VillaFacilitiesGrid({ facilities }: VillaFacilitiesGridProps) {
  if (facilities.length === 0) return null;

  const visibleFacilities = facilities.slice(0, 6);
  const hiddenFacilities = facilities.slice(6);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Facilities</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Fasilitas utama yang paling penting</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visibleFacilities.map((facility) => (
          <div key={facility} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]" />
            <p className="text-sm font-medium text-slate-700">{facility}</p>
          </div>
        ))}
      </div>

      {hiddenFacilities.length > 0 && (
        <div className="mt-4">
          <Accordion className="w-full">
            <AccordionItem value="all-facilities" className="border-0">
              <AccordionTrigger className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 no-underline hover:no-underline">
                View all facilities
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {hiddenFacilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]" />
                      <p className="text-sm font-medium text-slate-700">{facility}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </section>
  );
}

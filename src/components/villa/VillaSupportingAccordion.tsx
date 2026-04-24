import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  HelpCircle,
  MapPin,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type TravelerFaq = {
  question: string;
  answer: string;
};

type StayRule = {
  title: string;
  detail: string;
  icon: LucideIcon;
};

type NearbySpot = {
  label: string;
  distance: string;
  icon: LucideIcon;
};

interface VillaSupportingAccordionProps {
  faqs: TravelerFaq[];
  rules: StayRule[];
  nearby: NearbySpot[];
}

export function VillaSupportingAccordion({
  faqs,
  rules,
  nearby,
}: VillaSupportingAccordionProps) {
  return (
    <section
      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
      aria-label="Informasi tambahan"
    >
      {/* Section Header */}
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">
          Info Penting
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Sebelum Anda menginap
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Aturan, pertanyaan umum, dan destinasi di sekitar properti.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {/* ── 1. Stay Rules ── */}
        {rules.length > 0 && (
          <Accordion className="w-full">
            <AccordionItem value="rules" className="border-0">
              <AccordionTrigger className="flex items-center gap-3 px-5 py-4 text-left no-underline hover:bg-slate-50 hover:no-underline sm:px-6">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#3A4A1F]/10">
                  <Clock3 className="h-4 w-4 text-[#3A4A1F]" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Kebijakan
                  </p>
                  <p className="text-base font-bold text-slate-900">Aturan Menginap</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6">
                  {rules.map((rule) => {
                    const Icon = rule.icon;
                    return (
                      <div
                        key={rule.title}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Icon className="h-3.5 w-3.5 text-[#3A4A1F]" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">{rule.title}</p>
                        </div>
                        <p className="text-sm leading-6 text-slate-500">{rule.detail}</p>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* ── 2. FAQ ── */}
        {faqs.length > 0 && (
          <Accordion className="w-full">
            <AccordionItem value="faq" className="border-0">
              <AccordionTrigger className="flex items-center gap-3 px-5 py-4 text-left no-underline hover:bg-slate-50 hover:no-underline sm:px-6">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Pertanyaan Umum
                  </p>
                  <p className="text-base font-bold text-slate-900">FAQ Tamu</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
                  {faqs.map((faq, index) => (
                    <div
                      key={faq.question}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="mb-2 flex items-start gap-2">
                        <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#3A4A1F]/10 text-[10px] font-bold text-[#3A4A1F]">
                          {index + 1}
                        </span>
                        <p className="text-sm font-bold text-slate-900">{faq.question}</p>
                      </div>
                      <p className="pl-7 text-sm leading-6 text-slate-500">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* ── 3. Nearby Spots ── */}
        {nearby.length > 0 && (
          <Accordion className="w-full">
            <AccordionItem value="nearby" className="border-0">
              <AccordionTrigger className="flex items-center gap-3 px-5 py-4 text-left no-underline hover:bg-slate-50 hover:no-underline sm:px-6">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <MapPin className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Lingkungan
                  </p>
                  <p className="text-base font-bold text-slate-900">Lokasi Sekitar</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="grid gap-2 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6">
                  {nearby.map((spot) => {
                    const Icon = spot.icon;
                    return (
                      <div
                        key={spot.label}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                            <Icon className="h-3.5 w-3.5 text-[#3A4A1F]" />
                          </div>
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {spot.label}
                          </p>
                        </div>
                        <span className="flex-shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm ring-1 ring-slate-100">
                          {spot.distance}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    </section>
  );
}

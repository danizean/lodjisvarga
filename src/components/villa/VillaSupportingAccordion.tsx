import type { LucideIcon } from "lucide-react";
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
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Supporting Info</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Informasi tambahan saat Anda butuh</h2>
      </div>

      <Accordion className="w-full">
        <AccordionItem value="faq" className="border-slate-100">
          <AccordionTrigger className="py-4 text-base font-semibold text-slate-950 no-underline hover:no-underline">
            FAQ
          </AccordionTrigger>
          <AccordionContent className="pt-1">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{faq.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rules" className="border-slate-100">
          <AccordionTrigger className="py-4 text-base font-semibold text-slate-950 no-underline hover:no-underline">
            Rules
          </AccordionTrigger>
          <AccordionContent className="pt-1">
            <div className="grid gap-3 sm:grid-cols-2">
              {rules.map((rule) => {
                const Icon = rule.icon;

                return (
                  <div key={rule.title} className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white p-2 shadow-sm">
                        <Icon className="h-4 w-4 text-[#3A4A1F]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{rule.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{rule.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="nearby" className="border-slate-100">
          <AccordionTrigger className="py-4 text-base font-semibold text-slate-950 no-underline hover:no-underline">
            Nearby
          </AccordionTrigger>
          <AccordionContent className="pt-1">
            <div className="grid gap-3 sm:grid-cols-2">
              {nearby.map((spot) => {
                const Icon = spot.icon;

                return (
                  <div key={spot.label} className="rounded-2xl bg-slate-50 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white p-2 shadow-sm">
                        <Icon className="h-4 w-4 text-[#3A4A1F]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{spot.label}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{spot.distance}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

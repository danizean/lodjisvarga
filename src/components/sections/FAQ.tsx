"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS_DATA = [
  {
    q: "Pukul berapa waktu check-in dan check-out?",
    a: "Check-in dimulai pukul 14:00 hingga 23:59 WIB, dan check-out maksimal pukul 12:00 WIB. Early check-in tersedia dengan biaya tambahan tergantung ketersediaan kamar.",
  },
  {
    q: "Apakah lokasi villa dekat dengan pusat kota Yogyakarta?",
    a: "Ya, Lodjisvarga Villa Jogja berlokasi di Tridadi, Sleman. Sekitar 10–15 menit menuju pusat kota seperti Tugu Jogja dan Malioboro, serta dekat dengan Sleman City Hall.",
  },
  {
    q: "Berapa kapasitas maksimal tamu dalam satu kamar?",
    a: "Setiap unit umumnya dirancang untuk 2 tamu dewasa. Beberapa tipe kamar memungkinkan tambahan tamu sesuai kebijakan dan ketersediaan.",
  },
  {
    q: "Fasilitas apa saja yang tersedia di villa?",
    a: "Villa dilengkapi fasilitas seperti WiFi gratis, AC, Smart TV, kulkas, parkir gratis, serta beberapa unit memiliki private pool untuk kenyamanan menginap Anda.",
  },
  {
    q: "Apakah villa ini cocok untuk staycation keluarga atau pasangan?",
    a: "Sangat cocok. Dengan suasana yang tenang, nyaman, dan lokasi strategis di Sleman, villa ini ideal untuk pasangan maupun keluarga yang ingin staycation di Jogja.",
  },
  {
    q: "Apakah tersedia sarapan atau restoran di dalam villa?",
    a: "Saat ini sarapan tidak selalu termasuk dalam paket. Namun, terdapat banyak pilihan kuliner di sekitar villa seperti Jejamuran yang berjarak sekitar 1 km.",
  },
];

export function FAQ() {
  return (
    <section className="relative pt-12 pb-12 md:pt-16 md:pb-20 bg-[#F7F6F2] overflow-hidden">
      <Container className="max-w-4xl px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight leading-tight">
            Pertanyaan <span className="italic text-[#D4AF37]">Umum</span>
          </h2>
          <p className="text-gray-500 font-light text-sm md:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
            Informasi penting sebelum Anda menginap di Lodjisvarga Villa Jogja.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 shadow-[0_15px_40px_rgba(58,74,31,0.05)] border border-[#3A4A1F]/5"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS_DATA.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-[#3A4A1F]/5 py-1 last:border-0"
              >
                <AccordionTrigger className="text-left text-[#1A1A1A] font-bold text-base md:text-lg hover:text-[#3A4A1F] hover:no-underline transition-colors duration-200 py-4 group">
                  <span className="group-data-[state=open]:text-[#D4AF37] transition-colors duration-200">
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-gray-500 font-light leading-relaxed text-sm md:text-base pt-1 pb-5 pr-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

      </Container>
    </section>
  );
}
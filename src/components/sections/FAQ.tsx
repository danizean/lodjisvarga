import { Container } from "@/components/shared/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      q: "Pukul berapa waktu check-in dan check-out?",
      a: "Check-in dimulai pukul 14:00 hingga 23:59 WIB, dan check-out maksimal pukul 12:00 WIB. Early check-in tersedia dengan biaya tambahan tergantung ketersediaan kamar."
    },
    {
      q: "Apakah lokasi villa dekat dengan pusat kota Yogyakarta?",
      a: "Ya, Lodjisvarga Villa Jogja berlokasi di Tridadi, Sleman. Sekitar 10–15 menit menuju pusat kota seperti Tugu Jogja dan Malioboro, serta dekat dengan Sleman City Hall."
    },
    {
      q: "Berapa kapasitas maksimal tamu dalam satu kamar?",
      a: "Setiap unit umumnya dirancang untuk 2 tamu dewasa. Beberapa tipe kamar memungkinkan tambahan tamu sesuai kebijakan dan ketersediaan."
    },
    {
      q: "Fasilitas apa saja yang tersedia di villa?",
      a: "Villa dilengkapi fasilitas seperti WiFi gratis, AC, Smart TV, kulkas, parkir gratis, serta beberapa unit memiliki private pool untuk kenyamanan menginap Anda."
    },
    {
      q: "Apakah villa ini cocok untuk staycation keluarga atau pasangan?",
      a: "Sangat cocok. Dengan suasana yang tenang, nyaman, dan lokasi strategis di Sleman, villa ini ideal untuk pasangan maupun keluarga yang ingin staycation di Jogja."
    },
    {
      q: "Apakah tersedia sarapan atau restoran di dalam villa?",
      a: "Saat ini sarapan tidak selalu termasuk dalam paket. Namun, terdapat banyak pilihan kuliner di sekitar villa seperti Jejamuran yang berjarak sekitar 1 km."
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F7F6F2]">
      <Container className="max-w-4xl px-6 md:px-12">

        {/* HEADER */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight">
            Pertanyaan <span className="italic text-[#D4AF37]">Umum</span>
          </h2>
          <p className="text-gray-600 font-light text-sm md:text-lg mt-4">
            Informasi penting sebelum Anda menginap di Lodjisvarga Villa Jogja.
          </p>
        </div>

        {/* ACCORDION */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-[#3A4A1F]/10">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-[#3A4A1F]/10 py-3 last:border-0"
              >
                <AccordionTrigger className="text-left text-[#1A1A1A] font-bold text-base md:text-lg hover:text-[#3A4A1F] transition">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 font-light leading-relaxed text-sm md:text-base pt-3 pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </Container>
    </section>
  );
}
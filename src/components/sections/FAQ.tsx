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
      q: "Apa kebijakan Check-in dan Check-out di Lodjisvarga?",
      a: "Standard Check-in time dimulai dari pukul 14:00 WIB, dan Check-out maksimal pukul 12:00 WIB. Permintaan early check-in atau late check-out bergantung pada ketersediaan."
    },
    {
      q: "Apakah lokasi villa dekat dengan pusat kota?",
      a: "Sangat dekat. Hanya berjarak 10-15 menit berkendara menuju pusat perbelanjaan, Tugu Yogyakarta, dan Jl. Malioboro, memberikan akses mudah namun tetap menjaga privasi dan ketenangan Anda."
    },
    {
      q: "Berapa kapasitas tamu maksimal untuk setiap villa?",
      a: "Kapasitas bervariasi bergantung pada tipe kamar. Mayoritas villa kami secara optimal dirancang untuk 2 dewasa per kamar. Beberapa unit mengizinkan hingga 4 dewasa dengan ekstra penyewaan bed."
    },
    {
      q: "Apakah tersedia layanan tambahan seperti penyewaan kendaraan atau dekorasi?",
      a: "Tentu saja. Tersedia layanan 24/7 Butler yang dapat membantu mengatur penyewaan kendaraan eksklusif, romantic dinner, dekorasi kejutan, dan tur keliling kota Yogyakarta."
    }
  ];

  return (
    <section className="py-24 bg-[#F7F6F2]">
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#3A4A1F] text-4xl font-bold mb-4 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-gray-600 font-light text-lg">Everything you need to know about your upcoming stay.</p>
          </div>
          
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
            <Accordion className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100 py-3 last:border-0">
                  <AccordionTrigger className="text-left text-[#1A1A1A] font-bold text-lg hover:text-[#3A4A1F] transition-colors decoration-transparent text-base md:text-lg">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 font-light leading-relaxed text-base pt-3 pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Container>
    </section>
  );
}

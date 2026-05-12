import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Pusat Bantuan & FAQ | Lodjisvarga",
  description: "Pertanyaan yang sering diajukan seputar fasilitas, reservasi, dan aturan menginap di Lodjisvarga.",
};

const FAQS = [
  {
    question: "Bagaimana cara melakukan reservasi?",
    answer: "Reservasi dapat dilakukan dengan menghubungi nomor WhatsApp resmi kami (0851-8477-9808 / 0851-2351-8847). Tim kami akan membantu mengecek ketersediaan tanggal dan menginformasikan rincian harga."
  },
  {
    question: "Pukul berapa waktu check-in dan check-out?",
    answer: "Waktu check-in standar adalah mulai pukul 14:00 WIB, sedangkan waktu check-out maksimal pukul 12:00 WIB. Permintaan untuk early check-in atau late check-out dapat diajukan sesuai dengan ketersediaan kamar pada hari tersebut."
  },
  {
    question: "Apakah tersedia fasilitas private pool?",
    answer: "Ya, sebagian besar unit vila kami dilengkapi dengan kolam renang pribadi (private pool) untuk menjamin kenyamanan dan privasi Anda selama menginap."
  },
  {
    question: "Apakah ada dapur dan peralatan masak?",
    answer: "Tentu, setiap unit vila kami memiliki pantry/dapur bersih yang dilengkapi dengan peralatan masak standar, kulkas, microwave, dan dispenser air."
  },
  {
    question: "Bagaimana aksesibilitas lokasi vila?",
    answer: "Lodjisvarga memiliki akses yang sangat mudah dijangkau baik dengan kendaraan pribadi maupun layanan transportasi online. Akses jalan aspal yang lebar memudahkan mobil untuk langsung menuju area parkir pribadi vila."
  },
  {
    question: "Apakah properti ramah untuk acara besar atau pesta?",
    answer: "Untuk menjaga ketenangan dan kenyamanan lingkungan sekitar, Lodjisvarga dirancang khusus untuk liburan keluarga atau pasangan yang tenang (Tranquil Staycation). Acara skala besar atau pesta yang menimbulkan kebisingan memerlukan izin khusus dari manajemen."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#3A4A1F]/70 mb-4">
            Pusat Bantuan
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3A4A1F] leading-tight mb-6">
            Pertanyaan yang Sering Diajukan
          </h1>
          <div className="h-px w-20 bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan jawaban atas pertanyaan umum seputar pengalaman menginap, fasilitas, dan kebijakan di Lodjisvarga Luxury Villas.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-[#3A4A1F]/5 border border-[#3A4A1F]/5">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-[#3A4A1F]/10">
                <AccordionTrigger className="text-left text-[#3A4A1F] font-semibold hover:text-[#D4AF37] hover:no-underline text-lg py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed pb-6 text-base font-light">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Masih memiliki pertanyaan?</p>
          <a href="/contact" className="inline-flex items-center justify-center h-12 px-8 rounded-full text-sm font-bold tracking-wide transition-all bg-[#3A4A1F] text-white hover:bg-[#2D3621] hover:shadow-xl hover:shadow-[#3A4A1F]/20 active:scale-95">
            Hubungi Customer Service
          </a>
        </div>
      </div>
    </div>
  );
}
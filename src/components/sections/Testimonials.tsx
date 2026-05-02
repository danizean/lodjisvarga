"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Guest", review: "Pengalaman unik menginap di Sleman. Unit loft luas dengan konsep mezzanine, cocok untuk keluarga. Nyaman dan berbeda dari villa lain.", rating: 5 },
  { name: "Guest", review: "Sangat menikmati menginap di sini. Tempat nyaman dan cocok untuk pasangan maupun keluarga. Sangat direkomendasikan.", rating: 5 },
  { name: "Guest", review: "Villa masih baru, bersih, wangi, dan estetik. Harga terjangkau dan pelayanan staf sangat ramah serta sigap.", rating: 5 },
  { name: "Guest", review: "Lokasi sangat strategis dekat pusat kota dan mall. Fasilitas lengkap, pelayanan ramah, bahkan dapat welcome drink.", rating: 5 },
  { name: "Guest", review: "Parkiran luas, fasilitas lengkap seperti smart TV, water heater, dan private pool. Cocok untuk staycation.", rating: 5 },
  { name: "Guest", review: "Suasana tenang dan nyaman. Kamar bersih, perlengkapan lengkap, dan pelayanan sangat membantu. Worth it.", rating: 5 },
];

// Sub-komponen Kartu agar kode lebih bersih
function TestimonialCard({ item, index }: { item: typeof testimonials[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-[#3A4A1F]/5 flex flex-col justify-between hover:shadow-xl hover:shadow-[#3A4A1F]/5 transition-all duration-500 group"
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
            ))}
          </div>
          <Quote className="w-8 h-8 text-[#3A4A1F]/5 group-hover:text-[#D4AF37]/20 transition-colors" />
        </div>
        
        <p className="text-gray-600 text-sm md:text-base leading-relaxed italic mb-6">
          "{item.review}"
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
        <div className="w-10 h-10 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center text-[#3A4A1F] font-bold text-xs">
          {item.name.charAt(0)}
        </div>
        <p className="text-xs font-bold text-[#3A4A1F] uppercase tracking-widest">
          {item.name}
        </p>
      </div>
    </motion.div>
  );
}

export function Testimonials() {
  return (
    <section className="relative pt-16 pb-16 md:pt-24 md:pb-24 bg-[#F7F6F2] overflow-hidden">
      <Container className="max-w-6xl px-6 md:px-12 relative z-10">

        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16 space-y-4"
        >
          <h2 className="text-3xl md:text-5xl font-serif text-[#3A4A1F] tracking-tight">
            Review <span className="italic text-[#D4AF37]">Tamu Kami</span>
          </h2>

          <p className="text-gray-600 text-sm md:text-lg font-light leading-relaxed">
            Kepercayaan Anda adalah prioritas kami. Simak pengalaman berkesan dari tamu Lodjisvarga Villa Jogja.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              ))}
            </div>
            <span className="text-sm text-[#3A4A1F] font-semibold">
              4.8 / 5.0 <span className="text-gray-400 font-normal ml-1">Google Reviews</span>
            </span>
          </div>
        </motion.div>

        {/* MOBILE SLIDER (Menggunakan Flex & Snap) */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar -mx-6 px-6">
            {testimonials.map((item, index) => (
              <div key={index} className="snap-start min-w-[280px] flex">
                <TestimonialCard item={item} index={index} />
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP GRID */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <TestimonialCard key={index} item={item} index={index} />
          ))}
        </div>

      </Container>
    </section>
  );
}
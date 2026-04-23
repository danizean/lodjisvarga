"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import Image from "next/image";
import { ArrowRight, MapPin, Utensils, Star, SwatchBook } from "lucide-react";

// Slider Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const villaImages = [
  { id: 1, src: "/images/11.jpg" },
  { id: 2, src: "/images/7.jpg" },
  { id: 3, src: "/images/11.jpg" },
  { id: 4, src: "/images/7.jpg" },
  { id: 5, src: "/images/11.jpg" },
];

export function AboutExperience() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 bg-[#F7F6F2] overflow-hidden">
      {/* Smooth Transition dari Hero */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/10 to-transparent -translate-y-full pointer-events-none z-0" />

      <Container className="max-w-6xl px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ===== RIGHT CONTENT (Visual Slider) ===== 
              Ditaruh di atas pada mobile menggunakan order normal flex-col
          */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="w-full lg:col-span-5 order-1 lg:order-2"
          >
            <div className="relative group mx-auto max-w-[420px]">
              {/* Decorative Frame */}
              <div className="absolute -inset-3 border border-[#D4AF37]/30 rounded-[2rem] -z-10" />
              
              {/* Container Fixed Ratio 4:5 (Anti-Putih) */}
              <div className="relative w-full pt-[125%] rounded-[1.8rem] overflow-hidden shadow-2xl border border-[#D4AF37]/10 bg-gray-200">
                <div className="absolute inset-0 w-full h-full">
                  <Swiper
                    modules={[Autoplay, EffectFade, Pagination]}
                    effect="fade"
                    loop={true}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{
                      clickable: true,
                      bulletClass: 'swiper-pagination-bullet !bg-[#D4AF37]',
                    }}
                    className="w-full h-full"
                  >
                    {villaImages.map((img, idx) => (
                      <SwiperSlide key={idx}>
                        <Image
                          src={img.src}
                          alt="Lodjisvarga Villa Gallery"
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          className="object-cover"
                          priority={idx === 0}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Minimalist Badge */}
                  <div className="absolute top-5 right-5 z-20 px-3 py-1.5 bg-[#3A4A1F]/80 text-white rounded-full backdrop-blur-sm flex items-center gap-2 border border-white/10">
                    <SwatchBook className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Gallery</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== LEFT CONTENT (Copywriting) ===== 
              Ditaruh di bawah pada mobile menggunakan order normal flex-col
          */}
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="w-full lg:col-span-7 space-y-8 order-2 lg:order-1"
          >
            {/* Tagline & Location */}
            <motion.div {...fadeInUp} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
                  <Star className="w-3 h-3 fill-current" /> 
                  Jagonya Nyaman
                </span>
                <div className="h-px w-8 bg-[#3A4A1F]/20" />
                <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#3A4A1F]/60 font-bold">
                  Villa Private Pool Yogyakarta
                </span>
              </div>

              <h2 className="text-[#3A4A1F] text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.15] tracking-tight">
                Destinasi <span className="italic text-[#D4AF37]">Private Villa</span> Terbaik di Yogyakarta
              </h2>

              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light max-w-2xl">
                Temukan harmoni antara kenyamanan modern dan ketenangan alam Sleman. 
                <strong className="text-[#3A4A1F]"> Lodjisvarga Villa Jogja</strong> hadir sebagai pelarian eksklusif bebas rokok, 
                hanya selangkah dari ikon kuliner <em className="text-[#D4AF37] not-italic font-medium">Jejamuran</em>. Tempat di mana privasi Anda 
                menjadi prioritas utama dalam balutan interior yang <span className="italic">stylish</span>.
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-y border-[#3A4A1F]/10"
            >
              <div className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center transition-colors group-hover:bg-[#D4AF37]/10">
                  <Utensils className="w-5 h-5 text-[#3A4A1F]/70 group-hover:text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3A4A1F]">Wisata Kuliner</h4>
                  <p className="text-xs text-gray-500 mt-1">Hanya 1 km dari Jejamuran, pusat hidangan lokal autentik.</p>
                </div>
              </div>
              <div className="flex gap-4 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center transition-colors group-hover:bg-[#D4AF37]/10">
                  <MapPin className="w-5 h-5 text-[#3A4A1F]/70 group-hover:text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3A4A1F]">Akses Strategis</h4>
                  <p className="text-xs text-gray-500 mt-1">±10 km menuju Tugu Jogja dan keramaian Malioboro.</p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="pt-4 flex justify-center lg:justify-start">
              <button className="group relative overflow-hidden bg-[#3A4A1F] text-white px-10 py-5 rounded-full transition-all duration-500 hover:bg-[#2D3621] shadow-lg hover:shadow-[#3A4A1F]/20">
                <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:text-[#3A4A1F]">
                  Pelajari Selengkapnya
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </span>
              </button>
            </motion.div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
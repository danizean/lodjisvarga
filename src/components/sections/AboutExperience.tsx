"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import Image from "next/image";
import { ArrowRight, MapPin, Coffee, Utensils, Star } from "lucide-react";

export function AboutExperience() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  return (
    <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 bg-[#F7F6F2] overflow-hidden">
      {/* Smooth Transition dari Hero - Padding atas diperkecil agar tidak 'kecrop' */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#F7F6F2] -translate-y-[98%] pointer-events-none" />

      <Container className="max-w-6xl px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ===== LEFT CONTENT (SEO FOCUS) ===== */}
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            className="lg:col-span-7 space-y-8"
          >
            {/* SEO Tagline & Location */}
            <motion.div {...fadeInUp} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-[10px] tracking-[0.3em] uppercase">
                  <Star className="w-3 h-3 fill-current" /> 
                  Premium Stay
                </span>
                <div className="h-px w-8 bg-[#3A4A1F]/20" />
                <span className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-[#3A4A1F]/60 font-medium">
                  Tridadi, Sleman
                </span>
              </div>

              {/* H2 untuk SEO: Menekankan Lokasi dan Jenis Properti */}
              <h2 className="text-[#3A4A1F] text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.15] tracking-tight">
                Destinasi <span className="italic text-[#D4AF37]">Private Villa</span> Terbaik di Yogyakarta
              </h2>

              <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light max-w-2xl">
                Temukan harmoni antara kenyamanan modern dan ketenangan alam Sleman. 
                <strong> Lodjisvarga Villa Jogja</strong> hadir sebagai pelarian eksklusif bebas rokok, 
                hanya selangkah dari ikon kuliner <em>Jejamuran</em>. Tempat di mana privasi Anda 
                menjadi prioritas utama dalam balutan interior yang <em>stylish</em>.
              </p>
            </motion.div>

            {/* Feature Highlights (SEO Keywords: Dekat Malioboro, Tugu, Jejamuran) */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-y border-[#3A4A1F]/10"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-[#3A4A1F]/70" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3A4A1F]">Wisata Kuliner</h4>
                  <p className="text-xs text-gray-500 mt-1">Hanya 1 km dari Jejamuran, pusat hidangan lokal autentik.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#3A4A1F]/70" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3A4A1F]">Akses Strategis</h4>
                  <p className="text-xs text-gray-500 mt-1">±10 km menuju Tugu Jogja dan keramaian Malioboro.</p>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="pt-4">
              <button className="group relative overflow-hidden bg-[#3A4A1F] text-white px-10 py-5 rounded-full transition-all hover:bg-[#2F4F2F] shadow-lg hover:shadow-[#3A4A1F]/20">
                <span className="relative z-10 flex items-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em]">
                  Pelajari Selengkapnya
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* ===== RIGHT CONTENT (Visual Focus) ===== */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="lg:col-span-5"
          >
            <div className="relative group mx-auto max-w-[420px]">
              {/* Decorative Frame */}
              <div className="absolute -inset-3 border border-[#D4AF37]/30 rounded-[2rem] -z-10 group-hover:inset-0 transition-all duration-700" />
              
              {/* Image Container with Custom Aspect Ratio */}
              <div className="relative aspect-[4/5] rounded-[1.8rem] overflow-hidden shadow-2xl">
                <Image
                  src="/images/11.jpg"
                  alt="Interior Mewah Lodjisvarga Villa Sleman Yogyakarta"
                  fill
                  className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                      <Coffee className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Experience</p>
                      <p className="text-sm font-serif italic text-[#3A4A1F]">Modern Javanese Living</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
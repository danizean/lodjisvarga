"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Compass } from "lucide-react";

export function Hero() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <section
      className="relative min-h-[90vh] md:min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0F1A14]"
      aria-label="Luxury Villa Lodjisvarga Midtown Yogyakarta"
    >
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/7.jpg"
          alt="Luxury private pool villa in Yogyakarta"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover scale-105 animate-subtle-zoom"
        />

        {/* Overlay Gelap: Ditingkatkan sedikit ke 50% agar tombol lebih pop */}
        <div className="absolute inset-0 bg-black/50 z-[1]" />
        
        {/* Vignette untuk fokus tengah */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] z-[2]" />

        {/* Seamless Blend ke Section Bawah */}
        <div className="absolute bottom-0 left-0 w-full h-40 md:h-64 z-[3] bg-gradient-to-t from-[#F7F6F2] via-[#F7F6F2]/60 to-transparent" />
      </div>

      {/* 2. Content Layer */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center pt-10">
        
        {/* Label */}
        <motion.span 
          {...fadeInUp}
          className="mb-4 md:mb-6 text-[#D4AF37] text-[10px] md:text-xs tracking-[0.5em] uppercase font-semibold drop-shadow-md"
        >
          Exclusive Sanctuary in Yogyakarta
        </motion.span>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="font-serif text-5xl md:text-9xl leading-[1.1] tracking-tight pb-3 bg-gradient-to-b from-white via-[#F5F1E9] to-[#D4AF37] bg-clip-text text-transparent drop-shadow-2xl"
        >
          Lodjisvarga
        </motion.h1>

        {/* Subtitle */}
        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex items-center justify-center gap-4 mt-2 mb-8"
        >
          <div className="h-[1px] w-8 md:w-16 bg-[#D4AF37]/40 hidden sm:block" />
          <h2 className="text-[#D4AF37] font-light italic text-xl md:text-4xl tracking-[0.2em]">
            Mid Town Villas
          </h2>
          <div className="h-[1px] w-8 md:w-16 bg-[#D4AF37]/40 hidden sm:block" />
        </motion.div>

        {/* Description Text */}
        <motion.p 
          {...fadeInUp}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-xl text-white/90 text-sm md:text-lg font-light leading-relaxed mb-10 md:mb-14 italic"
        >
          Experience a harmonious blend of Javanese heritage and modern luxury in the heart of the cultural capital.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          {...fadeInUp}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto items-center"
        >
          {/* Tombol Utama (Check Availability) */}
          <Button className="group h-14 md:h-16 px-10 bg-[#2F4F2F] text-white hover:bg-[#3E623E] rounded-full transition-all duration-500 shadow-2xl border border-white/10 active:scale-95 w-full sm:w-auto">
            <span className="flex items-center gap-3 font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em]">
              <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
              Check Availability
            </span>
          </Button>

          {/* ✅ FIXED: Tombol Explore Villa (Kontras Tinggi) */}
          <Button
            variant="outline"
            className="group h-14 md:h-16 px-10 border-white/80 text-white hover:border-[#D4AF37] hover:text-[#D4AF37] rounded-full backdrop-blur-md transition-all duration-500 bg-white/10 hover:bg-black/40 active:scale-95 w-full sm:w-auto shadow-lg"
          >
            <span className="flex items-center gap-3 font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em]">
              <Compass className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Explore Villa
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
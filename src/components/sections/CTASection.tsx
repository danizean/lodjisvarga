"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { MessageCircle } from "lucide-react";

// 1. Konfigurasi diletakkan di luar komponen agar rapi dan mudah di-maintenance
const WA_CONFIG = {
  phoneNumber: "6285184779808",
  message: "Halo Lodjisvarga Villa, saya ingin menanyakan ketersediaan kamar. Bisa dibantu? Reff: Website",
};

export function CTASection() {
  // 2. Membuat URL WhatsApp yang sudah ter-encode
  const whatsappUrl = `https://wa.me/${WA_CONFIG.phoneNumber}?text=${encodeURIComponent(
    WA_CONFIG.message
  )}`;

  // 3. Helper untuk class agar JSX tidak terlalu "berantakan"
  const buttonClasses = `
    inline-flex items-center gap-3 h-14 md:h-16 px-10 rounded-full 
    bg-[#3A4A1F] text-white text-xs md:text-sm font-bold uppercase tracking-[0.2em] 
    transition-all duration-500 hover:bg-[#2D3621] shadow-xl 
    hover:shadow-[#3A4A1F]/25 hover:-translate-y-0.5 active:scale-95 
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/50 focus-visible:ring-offset-2
  `;

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 bg-[#F7F6F2] overflow-hidden">
      {/* Texture & Glow Overlays */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "url('/images/pattern.png')", backgroundRepeat: "repeat" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(212,175,55,0.07) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <Container className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight leading-tight">
            Siap Menginap di <span className="italic text-[#D4AF37]">Lodjisvarga Villa?</span>
          </h2>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
          className="text-gray-500 font-light text-sm md:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Cek ketersediaan unit dan dapatkan rekomendasi terbaik untuk pengalaman menginap Anda di Jogja.
        </motion.p>

        {/* CTA Button - Menggunakan tag 'a' untuk navigasi yang lebih baik secara semantik */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.28, ease: "easeOut" }}
          className="pt-4 flex justify-center"
        >
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses}
          >
            <MessageCircle className="w-5 h-5 text-[#D4AF37]" aria-hidden="true" />
            Cek via WhatsApp
          </a>
        </motion.div>

        {/* Micro copy */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.5 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-[10px] uppercase tracking-widest text-gray-400 font-medium"
        >
          Respon cepat melalui WhatsApp
        </motion.p>
      </Container>
    </section>
  );
}
"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { MessageCircle } from "lucide-react";

export function CTASection() {
  return (
    // bg-[#F7F6F2] disamakan dengan background krem di section sebelumnya agar seamless
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 bg-[#F7F6F2] overflow-hidden">
      
      {/* Background Decor (Optional): Menambahkan aksen mewah tipis */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/images/pattern.png')] bg-repeat" />

      <Container className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">

        {/* ===== HEADLINE WITH ANIMATION ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight leading-tight">
            Siap Menginap di{" "}
            <span className="italic text-[#D4AF37]">Lodjisvarga Villa?</span>
          </h2>
        </motion.div>

        {/* ===== SUBTEXT ===== */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 font-light text-sm md:text-lg max-w-xl mx-auto leading-relaxed"
        >
          Cek ketersediaan unit dan dapatkan rekomendasi terbaik untuk pengalaman menginap Anda di Jogja.
        </motion.p>

        {/* ===== CTA BUTTON ===== */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-4 flex justify-center"
        >
          <WhatsAppMessageForm
            villaName="Lodjisvarga Villa Jogja"
            buttonLabel="Cek via WhatsApp"
            title="Booking Lodjisvarga"
            // Button Styling: Tetap menggunakan Hijau Gelap agar kontras di atas background krem
            buttonClassName="inline-flex items-center h-12 md:h-16 px-10 rounded-full bg-[#3A4A1F] text-white text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-all duration-500 hover:bg-[#2D3621] shadow-xl hover:shadow-[#3A4A1F]/20 active:scale-95"
          >
            <MessageCircle className="w-5 h-5 mr-3 text-[#D4AF37]" />
            Cek via WhatsApp
          </WhatsAppMessageForm>
        </motion.div>

        {/* ===== MICRO COPY ===== */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-[10px] uppercase tracking-widest text-gray-400 font-medium"
        >
          Respon cepat melalui WhatsApp
        </motion.p>

      </Container>
    </section>
  );
}
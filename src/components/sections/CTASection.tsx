"use client";

import { Container } from "@/components/shared/Container";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { MessageCircle } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-white">

      <Container className="max-w-4xl mx-auto px-6 text-center space-y-8">

        {/* ===== HEADLINE ===== */}
        <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight leading-tight">
          Siap Menginap di{" "}
          <span className="italic text-[#D4AF37]">Lodjisvarga Villa?</span>
        </h2>

        {/* ===== SUBTEXT ===== */}
        <p className="text-gray-500 font-light text-sm md:text-lg max-w-xl mx-auto leading-relaxed">
          Cek ketersediaan unit dan dapatkan rekomendasi terbaik untuk pengalaman menginap Anda di Jogja.
        </p>

        {/* ===== CTA BUTTON ===== */}
        <div className="pt-4 flex justify-center">

          <WhatsAppMessageForm
            villaName="Lodjisvarga Villa Jogja"
            buttonLabel="Cek via WhatsApp"
            title="Booking Lodjisvarga"
            buttonClassName="inline-flex items-center h-12 md:h-14 px-8 rounded-full bg-[#3A4A1F] text-white text-sm md:text-base font-semibold tracking-wide transition-all duration-300 hover:bg-[#2F3F1A] hover:shadow-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Cek via WhatsApp
          </WhatsAppMessageForm>

        </div>

        {/* ===== MICRO COPY ===== */}
        <p className="text-xs text-gray-400">
          Respon cepat melalui WhatsApp
        </p>

      </Container>

    </section>
  );
}
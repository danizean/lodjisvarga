"use client";

import { Container } from "@/components/shared/Container";
import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Guest",
      review:
        "Pengalaman unik menginap di Sleman. Unit loft luas dengan konsep mezzanine, cocok untuk keluarga. Nyaman dan berbeda dari villa lain.",
      rating: 5,
    },
    {
      name: "Guest",
      review:
        "Sangat menikmati menginap di sini. Tempat nyaman dan cocok untuk pasangan maupun keluarga. Sangat direkomendasikan.",
      rating: 5,
    },
    {
      name: "Guest",
      review:
        "Villa masih baru, bersih, wangi, dan estetik. Harga terjangkau dan pelayanan staf sangat ramah serta sigap.",
      rating: 5,
    },
    {
      name: "Guest",
      review:
        "Lokasi sangat strategis dekat pusat kota dan mall. Fasilitas lengkap, pelayanan ramah, bahkan dapat welcome drink.",
      rating: 5,
    },
    {
      name: "Guest",
      review:
        "Parkiran luas, fasilitas lengkap seperti smart TV, water heater, dan private pool. Cocok untuk staycation.",
      rating: 5,
    },
    {
      name: "Guest",
      review:
        "Suasana tenang dan nyaman. Kamar bersih, perlengkapan lengkap, dan pelayanan sangat membantu. Worth it.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F7F6F2]">
      <Container className="max-w-6xl px-6 md:px-12">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl md:text-5xl font-serif text-[#3A4A1F] tracking-tight">
            Review <span className="italic text-[#D4AF37]">Tamu Kami</span>
          </h2>

          <p className="text-gray-600 text-sm md:text-lg font-light">
            Pengalaman nyata tamu yang telah menginap di Lodjisvarga Villa Jogja.
          </p>

          {/* RATING SUMMARY */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]"
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              4.8 / 5 (Google Reviews)
            </span>
          </div>
        </div>

        {/* ===== MOBILE SWIPE ===== */}
        <div className="md:hidden -mx-6 px-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-4 snap-x snap-mandatory">

            {testimonials.map((item, index) => (
              <div
                key={index}
                className="snap-start min-w-[85%] bg-white rounded-3xl p-6 shadow-md border border-[#3A4A1F]/10"
              >
                {/* Stars */}
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]"
                    />
                  ))}
                </div>

                {/* Review */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  “{item.review}”
                </p>

                {/* Name */}
                <p className="text-xs font-bold text-[#3A4A1F] uppercase tracking-wide">
                  {item.name}
                </p>
              </div>
            ))}

          </div>
        </div>

        {/* ===== DESKTOP GRID ===== */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-sm border border-[#3A4A1F]/10 hover:shadow-xl transition"
            >
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                “{item.review}”
              </p>

              {/* Name */}
              <p className="text-xs font-bold text-[#3A4A1F] uppercase tracking-wide">
                {item.name}
              </p>
            </div>
          ))}
        </div>

      </Container>
    </section>
  );
}
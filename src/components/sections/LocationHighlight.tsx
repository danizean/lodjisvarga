"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { MapPin, Navigation, Star, Clock } from "lucide-react";

const locations = [
  { title: "Masjid Agung Sleman", time: "2 menit", desc: "Tempat ibadah utama Sleman, bisa dijangkau dengan jalan kaki santai." },
  { title: "Sleman City Hall", time: "4 menit", desc: "Mal modern dengan bioskop dan tenant lengkap di jalur utama." },
  { title: "Kampung Flory", time: "5 menit", desc: "Wisata alam keluarga, resto pedesaan, dan terapi ikan." },
  { title: "Jejamuran Jogja", time: "8 menit", desc: "Kuliner ikonik olahan jamur yang wajib dikunjungi wisatawan." },
  { title: "Obelix Village", time: "9 menit", desc: "Destinasi wisata viral dengan mini zoo dan taman bunga cantik." },
  { title: "Ibarbo Park", time: "10 menit", desc: "Pusat oleh-oleh terbesar dengan taman aviary yang megah." },
  { title: "Terminal Jombor", time: "11 menit", desc: "Pusat akses transportasi bus antarkota dan travel." },
  { title: "Tugu Jogja", time: "18 menit", desc: "Ikon jantung kota Yogyakarta, akses lurus melalui Jl. Magelang." }
];

export function LocationHighlight() {
  const fadeInUp = {
    initial: { opacity: 0, y: 15 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" as const }
  };

  return (
    <section id="location" className="relative pt-12 pb-12 md:pt-20 md:pb-16 bg-[#F7F6F2] overflow-hidden">
      <Container className="max-w-6xl px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ===== SISI KIRI: KONTEN INFO ===== */}
          <motion.div 
            className="lg:col-span-7 space-y-8 md:space-y-10"
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
          >
            {/* Tagline & Judul */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-[#D4AF37] fill-current" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#3A4A1F]/60">
                  Prime Location
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif text-[#3A4A1F] leading-[1.1] tracking-tight">
                Akses Strategis <br /> 
                <span className="italic text-[#D4AF37]">Lodjisvarga Jogja</span>
              </h2>
            </div>

            {/* Grid Lokasi 2 Kolom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
              {locations.map((item, index) => (
                <motion.div
                  key={index}
                  {...fadeInUp}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-start gap-4 transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-[#3A4A1F] transition-colors duration-300">
                    <MapPin className="text-[#3A4A1F]/40 w-4 h-4 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-[#1A1A1A] text-sm leading-none">
                        {item.title}
                      </h4>
                      <span className="inline-flex items-center gap-1 text-[8px] font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                        <Clock className="w-2 h-2" />
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ===== SISI KANAN: KARTU PETA ===== */}
          <motion.div 
            className="lg:col-span-5 w-full flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Map Card Container */}
            <div className="relative w-full max-w-[420px] aspect-square rounded-[2.5rem] bg-white p-3 shadow-[0_20px_50px_rgba(58,74,31,0.1)] border border-white">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.7181638114434!2d110.35467617476525!3d-7.71336029230447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5f002a693b21%3A0xbd135fb0b7d7091e!2sLODJISVARGA%20VILLA%20JOGYA!5e0!3m2!1sid!2sid!4v1776119419862!5m2!1sid!2sid"
                  className="absolute inset-0 w-full h-full border-0 grayscale-[0.1] contrast-[1.05]"
                  allowFullScreen
                  loading="lazy"
                />
                
                {/* Overlay CTA Button */}
                <div className="absolute bottom-6 left-6 right-6">
                  <a
                    href="https://maps.app.goo.gl/G6NxSCE7w4Xz8F4s6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#3A4A1F] text-white px-6 py-4 rounded-xl shadow-xl flex items-center justify-center gap-3 text-xs font-bold hover:bg-[#2D3621] transition-all active:scale-95 group"
                  >
                    <Navigation className="w-4 h-4 text-[#D4AF37] group-hover:animate-pulse" />
                    Lihat Lokasi di Google Maps
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
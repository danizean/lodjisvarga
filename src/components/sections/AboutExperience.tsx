"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Utensils, Star, SwatchBook } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const villaImages = [
  { id: 1, src: "/images/potrait/1.jpg" },
  { id: 2, src: "/images/potrait/2.jpg" },
  { id: 3, src: "/images/potrait/3.jpg" },
  { id: 4, src: "/images/potrait/4.jpg" },
  { id: 5, src: "/images/potrait/5.jpg" },
];

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

export function AboutExperience() {
  return (
    <section className="relative pt-16 pb-10 md:pt-28 md:pb-16 bg-[#F7F6F2] overflow-hidden">
      <Container className="max-w-6xl px-5 md:px-12 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* Visual Slider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:col-span-5 order-1 lg:order-2"
          >
            <div className="relative group mx-auto max-w-[340px] sm:max-w-[400px] lg:max-w-[420px]">
              <div className="absolute -inset-2 md:-inset-3 border border-[#D4AF37]/20 rounded-[2rem] -z-10" />
              <div className="relative w-full pt-[125%] rounded-[1.6rem] md:rounded-[1.8rem] overflow-hidden shadow-2xl shadow-[#3A4A1F]/10 border border-[#D4AF37]/10 bg-gray-200">
                <div className="absolute inset-0 w-full h-full">
                  <Swiper
                    modules={[Autoplay, EffectFade, Pagination]}
                    effect="fade"
                    loop={true}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{
                      clickable: true,
                      bulletClass: "swiper-pagination-bullet !bg-[#D4AF37] !opacity-50 !w-1.5 !h-1.5",
                      bulletActiveClass: "!opacity-100 !w-4 !rounded-full transition-all duration-300",
                    }}
                    className="w-full h-full"
                  >
                    {villaImages.map((img) => (
                      <SwiperSlide key={img.id} className="relative w-full h-full">
                        <Image
                          src={img.src}
                          alt="Lodjisvarga Villa Gallery"
                          fill
                          sizes="(max-width: 768px) 340px, 420px"
                          className="object-cover"
                          priority={img.id === 1}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-[#3A4A1F]/80 text-white rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                    <SwatchBook className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Gallery</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <div className="w-full lg:col-span-7 space-y-7 md:space-y-9 order-2 lg:order-1">
            <motion.div {...fadeInUp} className="space-y-4 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 md:gap-3">
                <span className="flex items-center gap-1.5 text-[#D4AF37] font-bold text-[9px] md:text-[10px] tracking-[0.3em] uppercase shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  Jagonya Nyaman
                </span>
                <div className="h-px w-6 md:w-8 bg-[#3A4A1F]/20" />
                <span className="text-[9px] md:text-[11px] tracking-[0.2em] uppercase text-[#3A4A1F]/60 font-bold">
                  Villa Private Pool Yogyakarta
                </span>
              </div>
              <h2 className="text-[#3A4A1F] text-3xl md:text-5xl lg:text-6xl font-serif leading-tight tracking-tight">
                Destinasi <span className="italic text-[#D4AF37]">Private Villa</span> Terbaik di Yogyakarta
              </h2>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                Temukan harmoni antara kenyamanan modern dan ketenangan alam Sleman.{" "}
                <strong className="text-[#3A4A1F]"> Lodjisvarga Villa Jogja</strong> hadir sebagai pelarian eksklusif bebas rokok,{" "}
                hanya selangkah dari ikon kuliner <em className="text-[#D4AF37] not-italic font-medium">Jejamuran</em>. Tempat di mana privasi Anda{" "}
                menjadi prioritas utama dalam balutan interior yang <span className="italic">stylish</span>.
              </p>
            </motion.div>

            {/* Feature bullets */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 py-6 md:py-7 border-y border-[#3A4A1F]/10"
            >
              {[
                { Icon: Utensils, title: "Wisata Kuliner", desc: "Hanya 1 km dari Jejamuran, pusat hidangan lokal autentik." },
                { Icon: MapPin, title: "Akses Strategis", desc: "±10 km menuju Tugu Jogja dan keramaian Malioboro." },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex gap-3 md:gap-4 group items-start text-left">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#3A4A1F]/70 group-hover:text-[#D4AF37] transition-colors duration-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#3A4A1F]">{title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.25 }}
              className="flex justify-center lg:justify-start"
            >
              <Link
                href="/villas"
                className="group flex items-center gap-4 bg-[#3A4A1F] text-white pl-7 md:pl-9 pr-2 py-2 rounded-full hover:bg-[#2D3621] transition-all duration-300 shadow-lg hover:shadow-[#3A4A1F]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/50 focus-visible:ring-offset-2"
              >
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]">
                  Pelajari Selengkapnya
                </span>
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#D4AF37] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-[#3A4A1F]" />
                </div>
              </Link>
            </motion.div>
          </div>

        </div>
      </Container>
    </section>
  );
}
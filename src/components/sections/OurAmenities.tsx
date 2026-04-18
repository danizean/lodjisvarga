"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { Waves, Car, Tv, Snowflake, Wifi, Refrigerator } from "lucide-react";

export function OurAmenities() {
  const amenities = [
    {
      icon: Waves,
      title: "Private Pool Villa Jogja",
      desc: "Nikmati pengalaman menginap di villa Jogja dengan kolam renang pribadi yang tenang dan eksklusif.",
    },
    {
      icon: Wifi,
      title: "WiFi Gratis",
      desc: "Akses internet cepat di seluruh area villa Sleman untuk kebutuhan kerja maupun hiburan.",
    },
    {
      icon: Snowflake,
      title: "AC di Setiap Kamar",
      desc: "Kenyamanan maksimal dengan pendingin ruangan di setiap unit villa.",
    },
    {
      icon: Car,
      title: "Parkir Gratis",
      desc: "Area parkir luas dan aman untuk kendaraan pribadi selama menginap di Yogyakarta.",
    },
    {
      icon: Tv,
      title: "Smart TV & Hiburan",
      desc: "Nikmati hiburan modern dengan TV layar datar dan akses streaming di dalam kamar.",
    },
    {
      icon: Refrigerator,
      title: "Kulkas Pribadi",
      desc: "Fasilitas penyimpanan makanan dan minuman untuk kenyamanan selama menginap.",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isInteracting = useRef(false);

  // Detect active index
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const width = container.offsetWidth;
      const index = Math.round(scrollLeft / (width * 0.8));
      setActiveIndex(index);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Pause auto scroll saat user interaksi
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const start = () => (isInteracting.current = true);
    const end = () => (isInteracting.current = false);

    container.addEventListener("touchstart", start);
    container.addEventListener("mousedown", start);
    container.addEventListener("touchend", end);
    container.addEventListener("mouseup", end);

    return () => {
      container.removeEventListener("touchstart", start);
      container.removeEventListener("mousedown", start);
      container.removeEventListener("touchend", end);
      container.removeEventListener("mouseup", end);
    };
  }, []);

  // Auto scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (isInteracting.current) return;

      const width = container.offsetWidth;
      const nextIndex = (activeIndex + 1) % amenities.length;

      container.scrollTo({
        left: nextIndex * width * 0.8,
        behavior: "smooth",
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [activeIndex, amenities.length]);

  return (
    <section className="relative py-20 md:py-28 bg-[#F7F6F2] overflow-hidden">
      <Container className="max-w-6xl px-6 md:px-12">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
          <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight">
            Fasilitas <span className="italic text-[#D4AF37]">Villa Jogja</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-lg font-light mt-4">
            Fasilitas lengkap untuk pengalaman menginap nyaman di villa Sleman Yogyakarta.
          </p>
        </div>

        {/* ===== MOBILE SWIPE (CLEAN) ===== */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 no-scrollbar"
          >
            {amenities.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  className="snap-start min-w-[80%] bg-white/80 backdrop-blur rounded-3xl p-6 shadow-md border border-[#3A4A1F]/10"
                >
                  <div className="w-14 h-14 bg-[#3A4A1F]/5 rounded-full flex items-center justify-center mb-4">
                    <Icon className="text-[#3A4A1F] w-6 h-6" />
                  </div>

                  <h3 className="text-base font-bold text-[#1A1A1A] mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* INDICATOR (SINGLE, CLEAN) */}
          <div className="flex justify-center gap-2 mt-2">
            {amenities.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 rounded-full ${
                  i === activeIndex
                    ? "w-6 h-1.5 bg-[#3A4A1F]"
                    : "w-2 h-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ===== DESKTOP GRID ===== */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                className="group bg-white/70 backdrop-blur border border-[#3A4A1F]/10 rounded-3xl p-8 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-500"
              >
                <div className="w-16 h-16 bg-[#3A4A1F]/5 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Icon className="text-[#3A4A1F] w-7 h-7" />
                </div>

                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 font-light">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </Container>
    </section>
  );
}
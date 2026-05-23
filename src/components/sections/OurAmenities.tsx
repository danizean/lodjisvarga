"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { Waves, Car, Tv, Snowflake, Wifi, Refrigerator } from "lucide-react";

const AMENITIES_DATA = [
  { icon: Waves, title: "Private Pool Villa Jogja", desc: "Nikmati pengalaman menginap di villa Jogja dengan kolam renang pribadi yang tenang dan eksklusif." },
  { icon: Wifi, title: "WiFi Gratis", desc: "Akses internet cepat di seluruh area villa Sleman untuk kebutuhan kerja maupun hiburan." },
  { icon: Snowflake, title: "AC di Setiap Kamar", desc: "Kenyamanan maksimal dengan pendingin ruangan di setiap unit villa." },
  { icon: Car, title: "Parkir Gratis", desc: "Area parkir luas dan aman untuk kendaraan pribadi selama menginap di Yogyakarta." },
  { icon: Tv, title: "Google Smart TV", desc: "Nikmati hiburan tanpa batas dengan Google Smart TV." },
  { icon: Refrigerator, title: "Kulkas Pribadi", desc: "Fasilitas penyimpanan makanan dan minuman untuk kenyamanan selama menginap." },
];

const CARD_WIDTH_RATIO = 0.85;
const MOBILE_GAP_PX = 16;

export function OurAmenities() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardStep, setCardStep] = useState(0);
  const isInteracting = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateCardStep = () => {
      const nextStep = container.clientWidth * CARD_WIDTH_RATIO + MOBILE_GAP_PX;
      setCardStep(nextStep);
    };

    updateCardStep();
    const observer = new ResizeObserver(updateCardStep);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

      frameRef.current = requestAnimationFrame(() => {
        if (cardStep <= 0) return;
        const index = Math.min(
          Math.round(container.scrollLeft / cardStep),
          AMENITIES_DATA.length - 1
        );
        setActiveIndex(index);
      });
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [cardStep]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || cardStep <= 0) return;

    const interval = setInterval(() => {
      if (isInteracting.current) return;
      const nextIndex = (activeIndex + 1) % AMENITIES_DATA.length;
      container.scrollTo({ left: nextIndex * cardStep, behavior: "smooth" });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, cardStep]);

  const scrollToIndex = (index: number) => {
    const container = scrollRef.current;
    if (!container || cardStep <= 0) return;
    container.scrollTo({ left: index * cardStep, behavior: "smooth" });
  };

  return (
    <section className="relative pt-10 pb-12 md:pt-16 md:pb-20 bg-[#F7F6F2] overflow-hidden">
      <Container className="max-w-6xl px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-8 md:mb-12"
        >
          <span className="text-[#D4AF37] font-bold tracking-[0.4em] uppercase text-[9px] block mb-2">
            Our Facilities
          </span>
          <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight">
            Fasilitas <span className="italic text-[#D4AF37]">Lodjisvarga</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-lg font-light mt-4 leading-relaxed">
            Fasilitas lengkap untuk pengalaman menginap nyaman di villa Yogyakarta.
          </p>
        </motion.div>

        {/* Mobile slider */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            onTouchStart={() => (isInteracting.current = true)}
            onTouchEnd={() => (isInteracting.current = false)}
            onMouseDown={() => (isInteracting.current = true)}
            onMouseUp={() => (isInteracting.current = false)}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 no-scrollbar"
          >
            {AMENITIES_DATA.map((item, index) => (
              <div
                key={index}
                className="snap-center flex-shrink-0 bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-[#3A4A1F]/5"
                style={{ width: `${CARD_WIDTH_RATIO * 100}%` }}
              >
                <div className="w-12 h-12 bg-[#3A4A1F]/5 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="text-[#3A4A1F] w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Clickable dot indicators */}
          <div className="mt-2 flex justify-center gap-1" role="tablist" aria-label="Fasilitas navigation">
            {AMENITIES_DATA.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Fasilitas ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/40"
              >
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-all duration-500 ${
                    i === activeIndex
                      ? "h-1.5 w-6 bg-[#3A4A1F]"
                      : "h-1.5 w-1.5 bg-[#3A4A1F]/20"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {AMENITIES_DATA.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
              className="group bg-white/70 backdrop-blur border border-[#3A4A1F]/5 rounded-[2rem] p-8 text-center hover:bg-white hover:shadow-xl hover:shadow-[#3A4A1F]/5 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-[#3A4A1F]/5 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-[#D4AF37]/10 transition-colors duration-300">
                <item.icon className="text-[#3A4A1F] w-7 h-7 group-hover:text-[#D4AF37] transition-colors duration-300" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

      </Container>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Compass, MapPin, ChevronDown } from "lucide-react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] w-full flex flex-col items-center justify-between overflow-hidden bg-[#0A0F0C] py-12 md:py-20"
    >
      {/* Parallax background */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 z-0">
        <Image
          src="/images/7.jpg"
          alt="Lodjisvarga Villa — Private Pool Villa Yogyakarta"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F0C] via-[#0A0F0C]/20 to-[#0A0F0C]/55 z-[1]" />
      </motion.div>

      {/* Main content */}
      <motion.div
        style={{ opacity: contentOpacity }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center flex-grow justify-center text-center"
      >
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-6 md:w-10 bg-[#C5A059]/50" />
          <p className="text-[#C5A059] text-[10px] md:text-[12px] tracking-[0.8em] uppercase font-bold">
            Jagonya Nyaman
          </p>
          <span className="h-px w-6 md:w-10 bg-[#C5A059]/50" />
        </div>

        <div className="flex flex-col items-center">
          <h1 className="font-serif text-[15vw] md:text-[7rem] lg:text-[9rem] leading-[1.1] tracking-tight bg-gradient-to-b from-[#F3E5AB] via-[#C5A059] to-[#8B5E3C] bg-clip-text text-transparent drop-shadow-md px-4 pb-6">
            Lodjisvarga
          </h1>

          <div className="flex flex-col items-center -mt-2">
            <h2 className="text-[#C5A059]/90 font-light italic text-2xl md:text-5xl tracking-[0.15em]">
              Mid Town Villas
            </h2>

            <div className="mt-12 flex items-center gap-5 md:gap-8 border-t border-white/20 pt-8">
              <span className="text-white/70 text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-bold">
                Private Pool
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <span className="text-white/70 text-[10px] md:text-[11px] tracking-[0.4em] uppercase font-bold">
                Luxury Interior
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1.2 }}
        className="relative z-10 w-full max-w-7xl px-10 flex flex-col md:flex-row items-center justify-between gap-10 mt-auto"
      >
        {/* Location tag */}
        <div className="flex items-center gap-3 text-white/80 md:w-1/3 order-last md:order-first">
          <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
          <span className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase font-bold">
            Tridadi, Sleman, Yogyakarta
          </span>
        </div>

        {/* Primary CTA — linked to /villas */}
        <div className="w-full md:w-1/3 flex justify-center">
          <Link
            href="/villas"
            className="group relative h-16 px-12 bg-transparent text-white border-2 border-[#C5A059]/40 rounded-full transition-all duration-700 overflow-hidden backdrop-blur-md inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]/60"
          >
            <div className="absolute inset-0 bg-[#C5A059] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center gap-3 font-extrabold text-[11px] uppercase tracking-[0.3em] group-hover:text-black transition-colors duration-500">
              <Compass className="w-5 h-5" />
              Explore Villa
            </span>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="hidden md:flex w-1/3 justify-end items-center gap-4 text-white/60">
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold">Discover</span>
          <div className="relative h-14 w-[2px] bg-white/10 overflow-hidden">
            <motion.div
              animate={{ y: [-56, 56] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-0 w-full h-1/2 bg-[#C5A059]"
            />
          </div>
        </div>
      </motion.div>

      {/* Scroll nudge — mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 md:hidden"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/40" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 w-full h-px bg-white/10 z-20" />
    </section>
  );
}
"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const SOCIAL_POSTS = [
  {
    image: "/images/ig/1.jpg",
    link: "https://www.instagram.com/p/DU4nAO9krIY/",
    caption: "Private pool & suasana tenang",
  },
  {
    image: "/images/ig/2.jpg",
    link: "https://www.instagram.com/p/DVKvpFFkmAm/",
    caption: "Interior estetik & nyaman",
  },
  {
    image: "/images/ig/3.jpg",
    link: "https://www.instagram.com/p/DVAYg2OEgeg/",
    caption: "Staycation vibes di Sleman",
  },
  {
    image: "/images/ig/4.jpg",
    link: "https://www.instagram.com/p/DUM7_4cEr-Y/",
    caption: "Cocok untuk pasangan & keluarga",
  },
];

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className ?? "w-4 h-4 fill-current"} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.947s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47-.88-.64-1.61-1.47-2.12-2.44v10.17c-.03 2.16-.76 4.31-2.23 5.9-1.48 1.6-3.6 2.61-5.77 2.81-2.16.2-4.41-.33-6.16-1.67-1.75-1.34-2.88-3.41-3.05-5.61-.17-2.19.46-4.45 1.83-6.18 1.36-1.73 3.44-2.84 5.64-3.04.14-.01.27-.02.41-.02v4.03c-.11.01-.22.01-.32.02-1.38.13-2.67.92-3.37 2.12-.71 1.21-.8 2.72-.25 3.98.56 1.26 1.76 2.22 3.11 2.47 1.35.24 2.84-.1 3.84-1.07 1-.98 1.48-2.4 1.45-3.79V.02z" />
  </svg>
);

export function InstagramFeed() {
  return (
    <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 bg-[#F7F6F2] overflow-hidden border-t border-[#3A4A1F]/5">

      {/* Header */}
      <div className="text-center mb-10 px-6 space-y-3 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight leading-tight">
            Lihat <span className="italic text-[#D4AF37]">Suasana Asli Villa</span>
          </h2>
          <p className="text-gray-500 font-light text-sm md:text-lg max-w-xl mx-auto mt-3">
            Cuplikan momen nyata dari tamu kami. Geser untuk melihat pengalaman menginap di Lodjisvarga.
          </p>
        </motion.div>

        {/* Scroll hint — styled */}
        <div className="flex items-center justify-center gap-3 pt-2" aria-hidden="true">
          <motion.div
            animate={{ x: [-4, 0, -4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-4 h-px bg-[#D4AF37]/50"
          />
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold">
            Geser Galeri
          </p>
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-4 h-px bg-[#D4AF37]/50"
          />
        </div>
      </div>

      {/* Cards — with fade edges on desktop */}
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Left/right gradient fades */}
        <div className="hidden md:block absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#F7F6F2] to-transparent z-10 pointer-events-none" />
        <div className="hidden md:block absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#F7F6F2] to-transparent z-10 pointer-events-none" />

        <div className="flex md:justify-center overflow-x-auto gap-5 px-6 md:px-8 pb-8 no-scrollbar snap-x snap-mandatory">
          {SOCIAL_POSTS.map((post, idx) => (
            <motion.a
              key={idx}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={post.caption}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, duration: 0.45 }}
              viewport={{ once: true }}
              className="relative snap-start flex-shrink-0 w-[260px] aspect-[4/5] rounded-[2rem] overflow-hidden group shadow-xl border border-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                sizes="260px"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2a10]/85 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-5 left-5 right-5 text-white text-xs font-medium leading-relaxed">
                {post.caption}
              </div>
              <div className="absolute top-4 left-4 text-white text-[9px] font-bold bg-[#3A4A1F]/70 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                <InstagramIcon className="w-2.5 h-2.5 fill-current" />
                Gallery
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Dual CTA */}
      <div className="max-w-sm md:max-w-xl mx-auto mt-10 px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="https://www.instagram.com/lodjisvarga/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kunjungi Instagram Lodjisvarga"
            className="flex items-center justify-center gap-2.5 bg-[#3A4A1F] text-white px-6 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#2D3621] transition-all shadow-lg hover:shadow-[#3A4A1F]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/50"
          >
            <InstagramIcon />
            Instagram
          </a>
          <a
            href="https://www.tiktok.com/@lodjisvarga"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kunjungi TikTok Lodjisvarga"
            className="flex items-center justify-center gap-2.5 bg-white text-[#3A4A1F] px-6 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#3A4A1F]/15 hover:bg-gray-50 transition-all shadow-lg hover:shadow-gray-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/30"
          >
            <TikTokIcon />
            TikTok
          </a>
        </div>
      </div>
    </section>
  );
}
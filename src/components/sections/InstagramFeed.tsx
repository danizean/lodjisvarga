"use client";

import Image from "next/image";

export function InstagramFeed() {
  const posts = [
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

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">

      {/* ===== HEADER ===== */}
      <div className="text-center mb-10 px-6 space-y-4">
        <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-serif tracking-tight">
          Lihat <span className="italic text-[#D4AF37]">Suasana Asli Villa</span>
        </h2>

        <p className="text-gray-500 font-light text-sm md:text-lg max-w-xl mx-auto">
          Cuplikan langsung dari Instagram @lodjisvarga. Geser untuk melihat pengalaman menginap di villa kami.
        </p>

        <p className="text-xs text-gray-400">
          ← Geser untuk melihat →
        </p>
      </div>

      {/* ===== WRAPPER CENTER ===== */}
      <div className="max-w-6xl mx-auto">

        {/* ===== SCROLL CONTAINER ===== */}
        <div className="flex md:justify-center overflow-x-auto gap-4 px-4 md:px-0 pb-4 no-scrollbar snap-x snap-mandatory">

          {posts.map((post, idx) => (
            <a
              key={idx}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="relative snap-start min-w-[240px] md:min-w-[260px] aspect-[4/5] rounded-3xl overflow-hidden group shadow-md border border-[#3A4A1F]/10"
            >

              {/* IMAGE */}
              <Image
                src={post.image}
                alt={`Instagram Lodjisvarga ${idx + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* GRADIENT */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* CAPTION */}
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-medium">
                {post.caption}
              </div>

              {/* BADGE */}
              <div className="absolute top-3 left-3 text-white text-[10px] font-bold bg-black/50 px-3 py-1 rounded-full">
                Instagram
              </div>

              {/* HOVER ICON */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <svg width="20" height="20" fill="#3A4A1F" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="#3A4A1F" />
                  </svg>
                </div>
              </div>

            </a>
          ))}

        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="text-center mt-10 space-y-4">
        <p className="text-sm text-gray-600">
          Lihat lebih banyak aktivitas & update terbaru di Instagram kami
        </p>

        <a
          href="https://www.instagram.com/lodjisvarga/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#3A4A1F] text-white px-8 py-4 rounded-full text-sm font-bold tracking-wide hover:bg-[#2F3F1A] transition"
        >
          Follow @lodjisvarga
        </a>
      </div>

    </section>
  );
}
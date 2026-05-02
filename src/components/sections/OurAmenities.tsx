"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { Waves, Car, Tv, Snowflake, Wifi, Refrigerator } from "lucide-react";

// 1. Definisikan Data di Luar Komponen (Best Practice)
const AMENITIES_DATA = [
  { icon: Waves, title: "Private Pool Villa Jogja", desc: "Nikmati pengalaman menginap di villa Jogja dengan kolam renang pribadi yang tenang dan eksklusif." },
  { icon: Wifi, title: "WiFi Gratis", desc: "Akses internet cepat di seluruh area villa Sleman untuk kebutuhan kerja maupun hiburan." },
  { icon: Snowflake, title: "AC di Setiap Kamar", desc: "Kenyamanan maksimal dengan pendingin ruangan di setiap unit villa." },
  { icon: Car, title: "Parkir Gratis", desc: "Area parkir luas dan aman untuk kendaraan pribadi selama menginap di Yogyakarta." },
  { icon: Tv, title: "Google Smart TV", desc: "Nikmati hiburan tanpa batas dengan Google Smart TV." },
  { icon: Refrigerator, title: "Kulkas Pribadi", desc: "Fasilitas penyimpanan makanan dan minuman untuk kenyamanan selama menginap." },
];

export function OurAmenities() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isInteracting = useRef(false);

  // 2. Logika Deteksi Index Scroll (Mobile)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, offsetWidth } = container;
      // Menggunakan 0.7 sebagai threshold agar dot indicator berpindah lebih cepat saat di-swipe
      const index = Math.round(scrollLeft / (offsetWidth * 0.75));
      setActiveIndex(index);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // 3. Logika Auto-Scroll (Mobile)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      // Jika user sedang menyentuh layar, jangan auto-scroll
      if (isInteracting.current) return;
      
      const { offsetWidth } = container;
      const nextIndex = (activeIndex + 1) % AMENITIES_DATA.length;
      
      container.scrollTo({
        left: nextIndex * (offsetWidth * 0.85), // Menyesuaikan dengan min-w-[85%] di CSS
        behavior: "smooth",
      });
    }, 4000); // Dijeda 4 detik agar user sempat membaca

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <section className="relative pt-10 pb-12 md:pt-16 md:pb-20 bg-[#F7F6F2] overflow-hidden">
      <Container className="max-w-6xl px-6 md:px-12 relative z-10">

        {/* HEADER */}
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

        {/* MOBILE VIEW (Slider) */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            // Mencegah interaksi auto-scroll saat disentuh
            onTouchStart={() => (isInteracting.current = true)}
            onTouchEnd={() => (isInteracting.current = false)}
            onMouseDown={() => (isInteracting.current = true)}
            onMouseUp={() => (isInteracting.current = false)}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 no-scrollbar"
          >
            {AMENITIES_DATA.map((item, index) => (
              <div
                key={index}
                className="snap-center min-w-[85%] bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-[#3A4A1F]/5"
              >
                <div className="w-12 h-12 bg-[#3A4A1F]/5 rounded-full flex items-center justify-center mb-4">
                  <item.icon className="text-[#3A4A1F] w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* DOT INDICATORS */}
          <div className="flex justify-center gap-2 mt-2">
            {AMENITIES_DATA.map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-500 rounded-full h-1 ${
                  i === activeIndex ? "w-6 bg-[#3A4A1F]" : "w-1.5 bg-[#3A4A1F]/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW (Grid) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
          {AMENITIES_DATA.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group bg-white/70 backdrop-blur border border-[#3A4A1F]/5 rounded-[2rem] p-8 text-center hover:bg-white hover:shadow-xl hover:shadow-[#3A4A1F]/5 transition-all duration-500"
            >
              <div className="w-16 h-16 bg-[#3A4A1F]/5 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-[#D4AF37]/10 transition-colors">
                <item.icon className="text-[#3A4A1F] w-7 h-7 group-hover:text-[#D4AF37] transition-colors" />
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
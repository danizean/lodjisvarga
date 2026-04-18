import { Container } from "@/components/shared/Container";
import { MapPin, Navigation } from "lucide-react";

export function LocationHighlight() {
  const locations = [
    {
      title: "Sleman City Hall",
      desc: "Pusat belanja dan hiburan modern hanya ±900 meter dari villa.",
    },
    {
      title: "Jejamuran Jogja",
      desc: "Destinasi kuliner legendaris berjarak sekitar 1 km dari lokasi.",
    },
    {
      title: "Masjid Agung Sleman",
      desc: "Tempat ibadah utama hanya sekitar 200 meter dari villa.",
    },
    {
      title: "Kampung Flory",
      desc: "Wisata keluarga dan edukasi alam sekitar 1.3 km dari properti.",
    },
    {
      title: "RSUD Sleman",
      desc: "Fasilitas kesehatan hanya sekitar 3.4 km dari lokasi.",
    },
    {
      title: "Terminal Jombor",
      desc: "Akses transportasi umum utama sekitar 3.8 km dari villa.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F7F6F2]">
      <Container className="max-w-6xl px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 items-center">

          {/* ===== LEFT CONTENT ===== */}
          <div className="flex-1 space-y-6">

            <h2 className="text-3xl md:text-5xl font-serif text-[#3A4A1F] tracking-tight leading-tight">
              Lokasi <span className="italic text-[#D4AF37]">Strategis Villa</span> di Sleman
            </h2>

            <p className="text-gray-600 text-base md:text-lg font-light leading-relaxed">
              <strong>Lodjisvarga Villa Jogja</strong> berlokasi di 
              <strong> Tridadi, Sleman</strong>, dekat berbagai destinasi populer 
              seperti pusat kuliner, tempat belanja, dan fasilitas umum. 
              Lokasi ideal untuk menikmati ketenangan tanpa jauh dari pusat aktivitas Yogyakarta.
            </p>

            <ul className="space-y-4 pt-4">
              {locations.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 border-b border-[#3A4A1F]/10 pb-4"
                >
                  <div className="w-11 h-11 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center shrink-0">
                    <MapPin className="text-[#3A4A1F] w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1A1A1A] text-sm md:text-base">
                      {item.title}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 font-light mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== RIGHT MAP ===== */}
          <div className="flex-1 w-full">

            {/* IMPORTANT: relative di sini biar CTA tidak kabur */}
            <div className="relative w-full h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">

              {/* GOOGLE MAPS */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.7181638114434!2d110.35467617476525!3d-7.71336029230447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5f002a693b21%3A0xbd135fb0b7d7091e!2sLODJISVARGA%20VILLA%20JOGYA!5e0!3m2!1sid!2sid!4v1776119419862!5m2!1sid!2sid"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* CTA MAP (SUDAH FIX POSITION) */}
              <a
                href="https://maps.app.goo.gl/u1bYtTEwvKzM55cFA"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-xs md:text-sm font-bold text-[#3A4A1F] hover:bg-white transition"
              >
                <Navigation className="w-4 h-4" />
                Lihat di Google Maps
              </a>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
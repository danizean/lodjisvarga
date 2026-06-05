import { Container } from "@/components/shared/Container";
import { Star } from "lucide-react";

export function SEOContentBlock() {
  return (
    <section className="bg-[#FAF8F4] py-16 md:py-24 border-t border-[#3A4A1F]/5">
      <Container className="max-w-4xl px-6 md:px-12 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#D4AF37] fill-current" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#3A4A1F]/60">
              Tentang Kami
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif text-[#3A4A1F] leading-tight tracking-tight">
            Mengapa Memilih Penginapan Villa Private Pool di Jogja?
          </h2>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 text-sm md:text-base leading-relaxed text-justify md:text-left font-light">
          <p>
            Yogyakarta selalu menjadi destinasi liburan dan relaksasi favorit bagi wisatawan domestik maupun mancanegara. Untuk mendapatkan pengalaman menginap yang maksimal, memilih <strong>penginapan villa yogyakarta</strong> yang tepat adalah kuncinya. Baik Anda merencanakan <em>staycation</em> romantis, liburan keluarga, maupun acara kebersamaan dengan kerabat, akomodasi dengan fasilitas lengkap dan privasi tinggi akan membuat momen Anda semakin berkesan.
          </p>
          <p>
            Lodjisvarga hadir sebagai solusi bagi Anda yang mencari <strong>villa private pool jogja</strong> dengan fasilitas premium namun tetap memiliki <em>value for money</em> yang sangat baik. Menjadikannya salah satu opsi <strong>villa murah jogja</strong> di kelas eksklusif tanpa mengorbankan kenyamanan dan estetika. Dengan desain arsitektur yang <em>stylish</em> dan sentuhan modern tropis, setiap sudut <strong>villa yogyakarta</strong> kami dirancang untuk memberikan ketenangan pikiran.
          </p>
          <p>
            Lokasi kami yang strategis di area Sleman memberikan Anda akses mudah ke berbagai destinasi kuliner dan wisata populer, sekaligus menjauhkan Anda dari hiruk-pikuk pusat kota yang terlalu padat. Nikmati fasilitas kolam renang pribadi, dapur lengkap, hingga area komunal yang nyaman. Pesan sekarang melalui WhatsApp dan rasakan sendiri pengalaman <em>luxury staycation</em> bersama Lodjisvarga.
          </p>
        </div>
      </Container>
    </section>
  );
}

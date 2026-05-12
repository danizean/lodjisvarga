import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Tentang Kami | Lodjisvarga",
  description: "Cerita Lodjisvarga, jagonya nyaman villa di Jogja. Tempat menginap asri di Sleman, dan segera hadir di Seturan.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#3A4A1F]/70 mb-4">
            Tentang Kami
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#3A4A1F] leading-tight mb-6">
            Jagonya Nyaman<br className="hidden md:block" /> Villa di Jogja
          </h1>
          <div className="h-px w-20 bg-[#D4AF37] mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[#3A4A1F]/10 mix-blend-multiply z-10" />
            <Image 
              src="/images/villa-lodji.jpg" 
              alt="Villa Lodjisvarga di Sleman"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          
          <div className="space-y-8 text-gray-600 font-light leading-relaxed">
            <h2 className="text-3xl font-serif text-[#3A4A1F] leading-tight">
              Nyaman & Tenang di <span className="italic">Sleman</span>
            </h2>
            <p className="text-lg">
              Lodjisvarga hadir buat kamu yang cari tempat menginap paling nyaman di Jogja. Kami menggabungkan suasana alam yang tenang dengan fasilitas modern. Cocok banget buat kamu yang ingin lepas dari rasa capek dan sibuknya rutinitas, karena lokasi kami ada di lingkungan asri Sleman.
            </p>
            <p className="text-lg">
              Setiap sudut villa sengaja kami desain supaya kamu bisa santai maksimal. Ruangannya sejuk, udaranya segar, dan suasananya benar-benar bikin betah, seperti di rumah sendiri tapi dengan fasilitas liburan.
            </p>
            <div className="pl-6 border-l-2 border-[#D4AF37] italic text-xl text-[#3A4A1F] font-serif">
              "Kabar baiknya, sekarang kami juga sedang dalam proses pembangunan villa baru di Seturan! Makin dekat dengan pusat kota, tapi tetap dengan kenyamanan juara khas Lodjisvarga."
            </div>
            <p className="text-lg">
              Baik kamu mau bersantai tenang di Sleman, atau penasaran dengan cabang baru kami di Seturan nanti, kami selalu siap memberikan pelayanan terbaik biar momen menginapmu tidak terlupakan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
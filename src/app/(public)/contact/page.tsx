import type { Metadata } from "next";
import { Mail, MapPin, Smartphone, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Hubungi Kami | Lodjisvarga Villa",
  description: "Hubungi tim Lodjisvarga Villa Jogja untuk reservasi, kolaborasi, dan pertanyaan seputar akomodasi private pool.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#3A4A1F]/70 mb-4">
            Hubungi Kami
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3A4A1F] leading-tight mb-6">
            Mari Berbincang
          </h1>
          <div className="h-px w-20 bg-[#D4AF37] mx-auto mb-6" />
          <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light leading-relaxed">
            Punya pertanyaan seputar ketersediaan villa, fasilitas, atau ingin merencanakan momen spesial? Tim kami siap melayani Anda dengan hangat.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-[#3A4A1F]/5 border border-[#3A4A1F]/5 overflow-hidden mb-8 transform transition-all hover:-translate-y-1 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-[#3A4A1F] p-10 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                  <Smartphone className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h2 className="text-3xl font-serif mb-4">WhatsApp Reservasi</h2>
                <p className="text-white/80 font-light leading-relaxed mb-8">
                  Jalur komunikasi tercepat kami. Dapatkan informasi ketersediaan, promo terbaru, dan bantuan reservasi langsung dari tim Customer Service kami.
                </p>
                <div className="flex items-center gap-3 text-sm text-white/60 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Layanan operasional: 08:00 - 22:00 WIB</span>
                </div>
              </div>
            </div>
            
            <div className="p-10 md:p-12 flex flex-col justify-center bg-white space-y-6">
              <a 
                href="https://wa.me/6285184779808" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-[#3A4A1F]/5 hover:border-[#3A4A1F]/20 transition-all duration-300"
              >
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Customer Service 1</p>
                  <p className="text-2xl font-serif text-[#3A4A1F] group-hover:text-[#D4AF37] transition-colors">0851-8477-9808</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 text-[#3A4A1F]" />
                </div>
              </a>

              <a 
                href="https://wa.me/6285123518847" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-6 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-[#3A4A1F]/5 hover:border-[#3A4A1F]/20 transition-all duration-300"
              >
                <div>
                  <p className="text-sm text-gray-500 mb-1 font-medium">Customer Service 2</p>
                  <p className="text-2xl font-serif text-[#3A4A1F] group-hover:text-[#D4AF37] transition-colors">0851-2351-8847</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-5 h-5 text-[#3A4A1F]" />
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-lg shadow-[#3A4A1F]/5 border border-[#3A4A1F]/5 group hover:border-[#D4AF37]/30 transition-colors duration-500">
            <div className="w-12 h-12 bg-[#3A4A1F]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#3A4A1F] transition-colors duration-500">
              <Mail className="w-6 h-6 text-[#3A4A1F] group-hover:text-[#D4AF37] transition-colors duration-500" />
            </div>
            <h3 className="text-xl font-serif text-[#3A4A1F] mb-3">Email Formal</h3>
            <p className="text-gray-500 font-light mb-6 text-sm leading-relaxed">
              Untuk keperluan penawaran kerjasama, kolaborasi media, atau pertanyaan korporat.
            </p>
            <a 
              href="mailto:lodjisvargavilla@gmail.com" 
              className="inline-flex items-center gap-2 text-[#3A4A1F] font-semibold hover:text-[#D4AF37] transition-colors"
            >
              lodjisvargavilla@gmail.com
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-lg shadow-[#3A4A1F]/5 border border-[#3A4A1F]/5 group hover:border-[#D4AF37]/30 transition-colors duration-500">
            <div className="w-12 h-12 bg-[#3A4A1F]/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#3A4A1F] transition-colors duration-500">
              <MapPin className="w-6 h-6 text-[#3A4A1F] group-hover:text-[#D4AF37] transition-colors duration-500" />
            </div>
            <h3 className="text-xl font-serif text-[#3A4A1F] mb-3">Lokasi Properti</h3>
            <p className="text-gray-500 font-light mb-6 text-sm leading-relaxed">
              Sleman & Seturan, Yogyakarta<br />
              Daerah Istimewa Yogyakarta, Indonesia
            </p>
            <a 
              href="https://maps.app.goo.gl/nsfiHrQ5XqRZDu689" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#3A4A1F] font-semibold hover:text-[#D4AF37] transition-colors"
            >
              Buka di Google Maps
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
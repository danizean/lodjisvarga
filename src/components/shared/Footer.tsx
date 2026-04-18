"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Smartphone, MapPin, Mail, ArrowUpRight } from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F7F6F2] pt-24 pb-12 border-t border-[#3A4A1F]/5">
      <Container className="max-w-7xl">

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-12 mb-20">

          {/* BRAND */}
          <div className="md:col-span-4 space-y-6">
            <Link
              href="/"
              className="text-3xl font-serif text-[#3A4A1F] tracking-tight hover:opacity-80 transition"
            >
              Lodjisvarga
            </Link>

            <p className="text-gray-500 text-base font-light leading-relaxed max-w-sm">
              Membangun kenangan indah di jantung Sleman. Nikmati harmoni alam dan kenyamanan modern dalam setiap detik masa inap Anda.
            </p>

            {/* SOCIAL */}
            <div className="flex items-center gap-6 pt-4">

              {/* INSTAGRAM (FIXED) */}
              <Link
                href="https://www.instagram.com/lodjisvarga/"
                target="_blank"
                className="group flex items-center gap-2 text-sm font-medium text-[#3A4A1F]"
              >
                {/* SVG ICON */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-110"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>

                <span className="border-b border-transparent group-hover:border-[#3A4A1F] transition-all">
                  Instagram
                </span>
              </Link>

              <div className="h-4 w-[1px] bg-gray-300" />

              {/* WHATSAPP */}
              <WhatsAppMessageForm
                villaName="Lodjisvarga Villa Jogja"
                buttonLabel="WhatsApp"
                title="Chat Lodjisvarga"
                buttonClassName="group flex items-center gap-1 text-sm font-medium text-[#3A4A1F]"
              >
                <span className="border-b border-transparent group-hover:border-[#3A4A1F] transition-all">
                  WhatsApp
                </span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition -translate-y-1" />
              </WhatsAppMessageForm>

            </div>
          </div>

          {/* LINKS */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">

            {/* DESTINATIONS */}
            <div className="space-y-6">
              <h4 className="text-[#3A4A1F] font-bold text-xs tracking-[0.2em] uppercase">
                Destinations
              </h4>
              <ul className="space-y-4">
                <li><FooterLink href="/villas?location=sleman">Lodjisvarga Sleman</FooterLink></li>
                <li><FooterLink href="/villas?location=seturan">Lodjisvarga Seturan</FooterLink></li>
                <li><FooterLink href="/experience">Local Experience</FooterLink></li>
              </ul>
            </div>

            {/* EXPLORE */}
            <div className="space-y-6">
              <h4 className="text-[#3A4A1F] font-bold text-xs tracking-[0.2em] uppercase">
                Explore
              </h4>
              <ul className="space-y-4">
                <li><FooterLink href="/about">Our Story</FooterLink></li>
                <li><FooterLink href="/contact">Get in Touch</FooterLink></li>
                <li><FooterLink href="/faq">Help Center</FooterLink></li>
              </ul>
            </div>

            {/* CONTACT */}
            <div className="space-y-6 col-span-2 sm:col-span-1">
              <h4 className="text-[#3A4A1F] font-bold text-xs tracking-[0.2em] uppercase">
                Office
              </h4>

              <div className="space-y-4 text-sm text-gray-500 font-light">

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#3A4A1F]" />
                  <span>Sleman, Yogyakarta<br />Indonesia</span>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#3A4A1F]" />
                  <a href="mailto:hello@lodjisvarga.com" className="hover:text-[#3A4A1F] transition">
                    hello@lodjisvarga.com
                  </a>
                </div>

                <div className="pt-2">
                  <WhatsAppMessageForm
                    villaName="Lodjisvarga Villa Jogja"
                    buttonLabel="WhatsApp"
                    title="Chat Lodjisvarga"
                    buttonClassName="flex items-center gap-2 bg-[#3A4A1F] text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-[#2A3616] transition shadow-sm active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Book via WhatsApp
                  </WhatsAppMessageForm>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ===== BOTTOM ===== */}
        <div className="pt-8 border-t border-[#3A4A1F]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] sm:text-xs text-gray-400 tracking-widest uppercase">
            © {currentYear} Lodjisvarga Villa Jogja. Crafted for comfort.
          </p>

          <div className="flex gap-8 text-[10px] text-gray-400 uppercase tracking-[0.1em]">
            <Link href="/privacy" className="hover:text-[#3A4A1F] transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#3A4A1F] transition">Terms of Service</Link>
          </div>
        </div>

      </Container>
    </footer>
  );
}

/* ===== LINK COMPONENT ===== */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-gray-500 font-light hover:text-[#3A4A1F] hover:translate-x-1 transition inline-block"
    >
      {children}
    </Link>
  );
}
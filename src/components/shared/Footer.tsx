"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/shared/Container";
import { MapPin, Mail, Smartphone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A2312] text-white pt-24 pb-8 relative overflow-hidden">
      {/* Background aesthetic touches */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#3A4A1F]/50 rounded-full blur-[100px] pointer-events-none" />

      <Container className="max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Kolom 1 (Branding) */}
          <div className="space-y-8">
            <Link href="/" className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg">
              <div className="relative w-10 h-10 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo-lodji.png"
                  alt="Logo Lodjisvarga"
                  fill
                  sizes="40px"
                  className="object-contain brightness-0 invert opacity-95"
                  priority={false}
                  loading="lazy"
                />
              </div>
              <span className="text-2xl font-serif tracking-tight group-hover:text-[#D4AF37] transition-colors duration-500">
                Lodjisvarga Villa
              </span>
            </Link>

            <p className="text-white/60 font-light leading-relaxed text-sm">
              Menghadirkan harmoni alam dan kenyamanan modern dalam setiap detik masa inap Anda. Destinasi staycation privat di Yogyakarta.
            </p>

            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/lodjisvarga/"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="Instagram Lodjisvarga"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <span className="sr-only">Instagram Lodjisvarga</span>
              </a>
              <a
                href="https://www.tiktok.com/@lodjisvarga.villa"
                target="_blank"
                rel="noopener noreferrer nofollow"
                aria-label="TikTok Lodjisvarga"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/70 hover:bg-[#D4AF37] hover:text-white transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                <span className="sr-only">TikTok Lodjisvarga</span>
              </a>
            </div>
          </div>

          {/* Kolom 2 (Quick Links) */}
          <div className="lg:pl-8 space-y-6">
            <h3 className="font-bold text-[11px] tracking-[0.25em] uppercase text-[#D4AF37]">
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li><FooterLink href="/">Home</FooterLink></li>
              <li><FooterLink href="/villas">Villas</FooterLink></li>
              <li><FooterLink href="/blog">Blog</FooterLink></li>
              <li><FooterLink href="/promo">Promo</FooterLink></li>
            </ul>
          </div>

          {/* Kolom 3 (Support) */}
          <div className="space-y-6">
            <h3 className="font-bold text-[11px] tracking-[0.25em] uppercase text-[#D4AF37]">
              Support
            </h3>
            <ul className="space-y-4">
              <li><FooterLink href="/about">About</FooterLink></li>
              <li><FooterLink href="/faq">FAQ</FooterLink></li>
              <li><FooterLink href="/contact">Contact</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
            </ul>
          </div>

          {/* Kolom 4 (Contact Info) */}
          <div className="space-y-6">
            <h3 className="font-bold text-[11px] tracking-[0.25em] uppercase text-[#D4AF37]">
              Contact Info
            </h3>
            <div className="space-y-5 text-sm text-white/60 font-light">
              <div className="flex items-start gap-3.5 group">
                <div className="mt-1">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="leading-relaxed">
                  Sleman, Yogyakarta<br />
                  Indonesia
                </span>
              </div>

              <div className="flex items-center gap-3.5 group">
                <div>
                  <Mail className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <a href="mailto:lodjisvargavilla@gmail.com" rel="noopener noreferrer nofollow" className="hover:text-white transition-colors duration-300">
                  lodjisvargavilla@gmail.com
                </a>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3.5 group">
                  <div>
                    <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <a href="https://wa.me/6285184779808" rel="noopener noreferrer nofollow" className="hover:text-white transition-colors duration-300">
                    0851-8477-9808
                  </a>
                </div>
                <div className="flex items-center gap-3.5 group">
                  <div className="w-4 opacity-0" />
                  <a href="https://wa.me/6285123518847" rel="noopener noreferrer nofollow" className="hover:text-white transition-colors duration-300">
                    0851-2351-8847
                  </a>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Legal Bottom */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-[11px] text-white/40 tracking-[0.15em] uppercase">
            © {currentYear} Lodjisvarga Villa. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group text-sm text-white/60 font-light hover:text-white transition-colors duration-300 inline-flex items-center"
    >
      <span className="relative">
        {children}
        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
      </span>
    </Link>
  );
}

"use client";

import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Mail, MapPin } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";

export function Footer() {
  const waLink = generateWhatsAppLink("Halo, saya ingin berlangganan informasi terbaru Lodjisvarga.");
  
  return (
    <footer className="bg-[#A8BFA3]/10 pt-20 pb-8 border-t border-gray-100">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand Identity */}
          <div className="space-y-6 lg:col-span-1">
            <Link href="/" className="font-bold text-2xl tracking-tighter text-[#3A4A1F] inline-block">
              Lodjisvarga
            </Link>
            <p className="text-gray-600 font-light text-sm max-w-xs leading-relaxed">
              Luxury Private Sanctuary. Discover tranquility and exquisite living in the heart of Yogyakarta.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link href="https://instagram.com/lodjisvarga" target="_blank" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#3A4A1F] hover:bg-[#3A4A1F] hover:text-white transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </Link>
              <Link href={waLink} target="_blank" className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#3A4A1F] hover:bg-[#3A4A1F] hover:text-white transition-colors shadow-sm">
                <Smartphone className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h4 className="font-bold text-[#1A1A1A] mb-6">Our Villas</h4>
            <ul className="space-y-4 text-sm font-light text-gray-600">
              <li><Link href="/villas?location=sleman" className="hover:text-[#3A4A1F] transition-colors">Lodjisvarga Sleman</Link></li>
              <li><Link href="/villas?location=seturan" className="hover:text-[#3A4A1F] transition-colors">Lodjisvarga Seturan</Link></li>
              <li><Link href="/experience" className="hover:text-[#3A4A1F] transition-colors">Exclusive Experience</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="flex flex-col gap-8">
            <div>
              <h4 className="font-bold text-[#1A1A1A] mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-light text-gray-600">
                <li><Link href="/about" className="hover:text-[#3A4A1F] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-[#3A4A1F] transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-[#3A4A1F] transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <ul className="space-y-4 text-sm font-light text-gray-600">
                <li><Link href="/privacy" className="hover:text-[#3A4A1F] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#3A4A1F] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-[#1A1A1A] mb-6">Newsletter</h4>
            <p className="text-gray-600 text-sm font-light mb-4">
              Subscribe to receive special offers, news and events directly to your inbox.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Your email address" 
                className="bg-white border-white/50 focus-visible:ring-1 focus-visible:ring-[#3A4A1F] rounded-lg h-12 shadow-sm"
              />
              <Button type="button" className="w-full bg-[#3A4A1F] hover:bg-[#6E8F3B] text-white rounded-lg h-12 transition-colors font-semibold">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 font-light">
          <div>© {new Date().getFullYear()} Lodjisvarga. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#3A4A1F]/60"/> Yogyakarta, Indonesia</span>
            <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#3A4A1F]/60"/> hello@lodjisvarga.com</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

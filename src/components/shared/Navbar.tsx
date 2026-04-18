"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Tambahkan ini
import { usePathname } from "next/navigation";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";
import { Menu, X } from "lucide-react";
import { Container } from "@/components/shared/Container";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Villas", href: "/villas" },
    { name: "Experience", href: "/experience" },
    { name: "Blog", href: "/blog" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-[#3A4A1F]/10 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">
          
          {/* LOGO SECTION */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo-lodjisvarga.png"
                alt="Logo Lodjisvarga"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span
              className={`text-xl md:text-2xl font-serif tracking-tight transition-colors duration-300 ${
                isScrolled ? "text-[#3A4A1F]" : "text-white"
              }`}
            >
              Lodjisvarga
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-10">
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm tracking-wide transition relative group/link ${
                      isActive
                        ? "text-[#3A4A1F]"
                        : isScrolled
                        ? "text-gray-600 hover:text-[#3A4A1F]"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    {link.name}
                    {/* subtle underline */}
                    <span
                      className={`absolute left-0 -bottom-1 h-[1px] bg-[#3A4A1F] transition-all duration-300 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover/link:w-full group-hover/link:opacity-100"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* CTA */}
            <WhatsAppMessageForm
              villaName="Lodjisvarga Villa Jogja"
              buttonLabel="Cek Ketersediaan"
              title="Booking Lodjisvarga"
              buttonClassName="h-10 px-6 rounded-full bg-[#3A4A1F] text-white text-sm font-medium transition transform hover:scale-105 hover:bg-[#2F3F1A] active:scale-95 shadow-lg shadow-[#3A4A1F]/20"
            >
              Cek Ketersediaan
            </WhatsAppMessageForm>
          </div>

          {/* MOBILE BUTTON */}
          <button
            className={`md:hidden p-2 transition-colors ${
              isScrolled ? "text-[#3A4A1F]" : "text-white"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </Container>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#3A4A1F]/10 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col px-6 py-8 gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg transition-all ${
                    isActive
                      ? "text-[#3A4A1F] font-bold translate-x-2"
                      : "text-gray-600 hover:text-[#3A4A1F] hover:translate-x-2"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* CTA Mobile */}
            <WhatsAppMessageForm
              villaName="Lodjisvarga Villa Jogja"
              buttonLabel="Cek Ketersediaan"
              title="Booking Lodjisvarga"
              buttonClassName="mt-4 h-12 w-full rounded-full bg-[#3A4A1F] text-white text-sm font-semibold shadow-lg active:scale-95 transition-transform"
            >
              Cek Ketersediaan
            </WhatsAppMessageForm>
          </div>
        </div>
      )}
    </header>
  );
}
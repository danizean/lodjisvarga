"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/shared/Container";

/**
 * Konfigurasi untuk Navbar agar mudah diubah di satu tempat
 */
const NAV_CONFIG = {
  links: [
    { name: "Home", href: "/" },
    { name: "Villas", href: "/villas" },
    { name: "Promo", href: "/promo" },
    { name: "Blog", href: "/blog" },
  ],
  whatsapp: {
    number: "6285184779808",
    message: "Halo Lodjisvarga, saya ingin cek ketersediaan kamar untuk menginap.\n\nReff: Website",
  },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // 1. Logika Pembuatan Link WhatsApp
  const whatsappUrl = `https://wa.me/${NAV_CONFIG.whatsapp.number}?text=${encodeURIComponent(
    NAV_CONFIG.whatsapp.message
  )}`;

  // 2. Scroll Detection (Optimized with useCallback)
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    handleScroll(); // Check initial position
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 3. Body Scroll Lock
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMobileMenuOpen]);

  // 4. Reset menu saat pindah halaman
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ─── 5. Route-Aware Styling Logic ──────────────────────────────────────────
  // Identify if the current page has a dark hero background (needs white text initially)
  const isDarkHero = pathname === "/" || pathname === "/blog";

  // The header becomes solid glass when scrolled or when the mobile menu is open
  const isGlassHeader = isScrolled || isMobileMenuOpen;

  // Text should be dark if it's on a solid glass header, OR if the page has a light background
  const isDarkText = isGlassHeader || !isDarkHero;

  // Derived classes for premium aesthetic
  const textColorClass = isDarkText ? "text-[#3A4A1F]" : "text-white";
  const headerBgClass = isGlassHeader
    ? "bg-white/90 backdrop-blur-xl border-b border-[#3A4A1F]/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-3 md:py-4"
    : "bg-transparent py-6";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${headerBgClass}`}
      >
        <Container>
          <div className="flex items-center justify-between">
            {/* LOGO SECTION */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg"
              aria-label="Lodjisvarga Home"
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo-lodji.png"
                  alt="Logo Lodjisvarga"
                  fill
                  sizes="48px"
                  className={`object-contain transition-all duration-500 ${!isDarkText ? "brightness-0 invert opacity-95" : ""}`}
                  priority
                />
              </div>
              <span className={`text-xl md:text-2xl font-serif tracking-tight transition-colors duration-500 ${textColorClass}`}>
                Lodjisvarga
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-10">
              <nav className="flex items-center gap-8" aria-label="Main Navigation">
                {NAV_CONFIG.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm tracking-wide transition-colors duration-300 relative group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded px-1 py-0.5 ${
                        isActive
                          ? `${isDarkText ? "text-[#3A4A1F]" : "text-white"} font-semibold`
                          : `${isDarkText ? "text-gray-500 hover:text-[#3A4A1F]" : "text-white/70 hover:text-white"}`
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.name}
                      <span
                        className={`absolute left-0 -bottom-1.5 h-[1.5px] transition-all duration-300 ease-out rounded-full ${
                          isActive
                            ? `w-full ${isDarkText ? "bg-[#3A4A1F]" : "bg-white"}`
                            : `w-0 ${isDarkText ? "bg-[#3A4A1F]/30" : "bg-white/50"} group-hover/link:w-full`
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* DESKTOP CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center h-10 px-6 rounded-full text-sm font-bold tracking-wide transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 ${
                  isDarkText
                    ? "bg-[#3A4A1F] text-white hover:bg-[#2D3621] hover:shadow-lg hover:shadow-[#3A4A1F]/20"
                    : "bg-white text-[#3A4A1F] hover:bg-[#F7F6F2] hover:shadow-lg hover:shadow-white/20"
                }`}
              >
                Cek Ketersediaan
              </a>
            </div>

            {/* MOBILE TOGGLE BUTTON */}
            <button
              className={`md:hidden p-2 -mr-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg ${textColorClass}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </Container>

        {/* MOBILE MENU PANEL */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-full left-0 right-0 bg-white border-t border-[#3A4A1F]/10 shadow-2xl z-50 md:hidden overflow-hidden"
            >
              <nav className="flex flex-col px-6 py-8 gap-6" aria-label="Mobile Navigation">
                {NAV_CONFIG.links.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={`block text-lg transition-all p-1 -ml-1 ${
                          isActive
                            ? "text-[#3A4A1F] font-bold translate-x-2"
                            : "text-gray-600 hover:text-[#3A4A1F] hover:translate-x-2"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 mt-2 border-t border-gray-100"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-12 w-full rounded-full bg-[#3A4A1F] text-white text-sm font-bold tracking-wide shadow-lg active:scale-95 transition-all hover:bg-[#2D3621]"
                  >
                    Cek Ketersediaan
                  </a>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE MENU BACKDROP */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
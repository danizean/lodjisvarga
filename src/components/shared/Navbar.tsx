"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/shared/Container";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body Scroll Lock & Route Change Logic
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Villas", href: "/villas" },
    { name: "Promo", href: "/promo" },
    { name: "Blog", href: "/blog" },
  ];

  // Direct WhatsApp CTA Logic
  const waMessage = "Halo Lodjisvarga, saya ingin cek ketersediaan kamar untuk menginap.\n\nReff: Website";
  const waLink = generateWhatsAppLink(waMessage);

  // Derived state to ensure consistent visuals when mobile menu is open
  const isHeaderSolid = isScrolled || isMobileMenuOpen;
  const textColorClass = isHeaderSolid ? "text-[#3A4A1F]" : "text-white";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isHeaderSolid
            ? "bg-white/95 backdrop-blur-xl border-b border-[#3A4A1F]/10 py-3 md:py-4 shadow-sm"
            : "bg-transparent py-6"
        }`}
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
                  src="/logo-lodjisvarga.png"
                  alt="Logo Lodjisvarga"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <span
                className={`text-xl md:text-2xl font-serif tracking-tight transition-colors duration-500 ${textColorClass}`}
              >
                Lodjisvarga
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-10">
              <nav className="flex items-center gap-8" aria-label="Main Navigation">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`text-sm tracking-wide transition relative group/link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded px-1 py-0.5 ${
                        isActive
                          ? "text-[#3A4A1F] font-semibold"
                          : isHeaderSolid
                          ? "text-gray-600 hover:text-[#3A4A1F]"
                          : "text-white/90 hover:text-white"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {link.name}
                      {/* subtle underline */}
                      <span
                        className={`absolute left-0 -bottom-1 h-[1px] bg-[#3A4A1F] transition-all duration-300 ${
                          isActive
                            ? "w-full opacity-100"
                            : "w-0 opacity-0 group-hover/link:w-full group-hover/link:opacity-100"
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* DESKTOP CTA */}
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-[#3A4A1F] text-white text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:bg-[#2D3621] hover:shadow-xl hover:shadow-[#3A4A1F]/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
                aria-label="Cek Ketersediaan Kamar di WhatsApp"
              >
                Cek Ketersediaan
              </a>
            </div>

            {/* MOBILE TOGGLE BUTTON */}
            <button
              className={`md:hidden p-2 -mr-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg ${textColorClass}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </Container>

        {/* MOBILE MENU PANEL */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 bg-white border-t border-[#3A4A1F]/10 shadow-2xl z-50 md:hidden"
            >
              <nav className="flex flex-col px-6 py-8 gap-6" aria-label="Mobile Navigation">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className={`block text-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded-lg p-1 -ml-1 ${
                          isActive
                            ? "text-[#3A4A1F] font-bold translate-x-2"
                            : "text-gray-600 hover:text-[#3A4A1F] hover:translate-x-2"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* MOBILE CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="pt-4 mt-2 border-t border-gray-100"
                >
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-12 w-full rounded-full bg-[#3A4A1F] text-white text-sm font-bold tracking-wide shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 hover:bg-[#2D3621]"
                    aria-label="Cek Ketersediaan Kamar di WhatsApp"
                  >
                    Cek Ketersediaan
                  </a>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MOBILE MENU BACKDROP OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
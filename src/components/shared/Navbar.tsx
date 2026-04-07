"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";
import { buttonVariants } from "@/components/ui/button";
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

  const waLink = generateWhatsAppLink("Halo, saya tertarik untuk merencanakan liburan di Lodjisvarga dan ingin membuat reservasi.");

  const navbarClasses = isScrolled
    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
    : "bg-transparent py-6";
  
  const textClasses = isScrolled ? "text-[#1A1A1A]" : "text-white";
  const logoClasses = isScrolled ? "text-[#3A4A1F]" : "text-white";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarClasses}`}>
      <Container>
        <div className="flex items-center justify-between">
          <Link href="/" className={`font-bold text-2xl tracking-tight transition-colors ${logoClasses}`}>
            Lodjisvarga
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-[#A8BFA3] ${
                      isActive 
                        ? "text-[#A8BFA3] font-semibold" 
                        : isScrolled ? "text-gray-600" : "text-white/90"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            <Link 
              href={waLink} 
              target="_blank" 
              className={buttonVariants({ 
                className: "bg-[#3A4A1F] hover:bg-[#6E8F3B] text-white rounded-full px-7 transition-all duration-300 shadow-md font-semibold" 
              })}
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className={`md:hidden p-2 -mr-2 ${textClasses}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 flex flex-col p-6 gap-6 md:hidden">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-medium transition-colors ${
                  isActive ? "text-[#3A4A1F]" : "text-gray-600 hover:text-[#3A4A1F]"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link 
            href={waLink} 
            target="_blank" 
            className={buttonVariants({ className: "bg-[#3A4A1F] hover:bg-[#6E8F3B] text-white rounded-full mt-4 w-full h-12 text-base font-bold" })}
          >
            Book Now
          </Link>
        </div>
      )}
    </header>
  );
}

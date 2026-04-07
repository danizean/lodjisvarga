import { Container } from "@/components/shared/Container";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";
import { Button, buttonVariants } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CTASection() {
  const waLink = generateWhatsAppLink("Halo, saya tertarik untuk merencanakan liburan di Lodjisvarga dan ingin berkonsultasi lebih lanjut.");
  
  return (
    <section className="relative py-32 overflow-hidden mx-auto my-12 rounded-3xl lg:mx-8">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ background: "linear-gradient(135deg, #3A4A1F, #6E8F3B)" }} 
      />
      
      {/* Texture Overlay (Depth) */}
      <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
          alt="Villa Background Texture"
          fill
          className="object-cover"
        />
      </div>

      <Container className="relative z-10">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-sm leading-tight">
            Your Private Sanctuary Awaits
          </h2>
          <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-2xl leading-relaxed">
            Experience the perfect blend of luxury and nature. Our team is ready to assist you in planning an unforgettable stay.
          </p>
          
          <Link 
            href={waLink} 
            target="_blank"
            className={buttonVariants({ size: "lg", className: "bg-white text-[#3A4A1F] hover:bg-white/90 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 h-14 px-8 rounded-full text-base font-bold" })}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat on WhatsApp
          </Link>
        </div>
      </Container>
    </section>
  );
}

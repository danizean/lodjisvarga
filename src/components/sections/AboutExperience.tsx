import { Container } from "@/components/shared/Container";
import Image from "next/image";

export function AboutExperience() {
  return (
    <section className="py-24 bg-[#F7F6F2]">
      <Container>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text Left */}
          <div className="flex-1 space-y-6">
            <h2 className="text-[#3A4A1F] text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
              Private & Serene
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed font-light">
              Lodjisvarga was born from a desire to provide a tranquil escape within the vibrant heart of Yogyakarta. We believe that true luxury lies in absolute privacy, seamless personalized service, and a deep connection to nature.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-light mb-6">
              Our architectural philosophy embraces minimalist aesthetics combined with rich tropical landscapes, creating sanctuaries where your soul can rest and rejuvenate.
            </p>
            <button className="text-[#3A4A1F] font-semibold underline underline-offset-4 hover:text-[#6E8F3B] transition-colors">
              Read Our Story
            </button>
          </div>
          
          {/* Image Right */}
          <div className="flex-1 w-full relative">
            <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
              <Image 
                src="https://images.unsplash.com/photo-1542314831-c6a4d14eff3e?q=80&w=2000&auto=format&fit=crop"
                alt="Lodjisvarga Luxury Experience"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#A8BFA3]/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -right-6 w-48 h-48 bg-[#3A4A1F]/10 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </Container>
    </section>
  );
}

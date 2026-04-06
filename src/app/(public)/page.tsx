import { Hero } from "@/components/sections/Hero";
import { FeaturedVillas } from "@/components/sections/FeaturedVillas";
import { Testimonials } from "@/components/sections/Testimonials";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedVillas />
      <Testimonials />
      <CTASection />
    </>
  );
}

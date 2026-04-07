import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

import { Hero } from "@/components/sections/Hero";
import { AboutExperience } from "@/components/sections/AboutExperience";
import { FeaturedVillas } from "@/components/sections/FeaturedVillas";
import { OurAmenities } from "@/components/sections/OurAmenities";
import { LocationHighlight } from "@/components/sections/LocationHighlight";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F7F6F2]">
      <Navbar />
      <main className="flex-1 space-y-0">
        <Hero />
        <AboutExperience />
        {/* FeaturedVillas is a Server Component that fetches data and renders FeaturedVillasClient */}
        <FeaturedVillas />
        <OurAmenities />
        <LocationHighlight />
        <Testimonials />
        <FAQ />
        <InstagramFeed />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

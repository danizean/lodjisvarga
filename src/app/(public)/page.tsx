import { Hero } from "@/components/sections/Hero";
import { AboutExperience } from "@/components/sections/AboutExperience";
import { FeaturedVillas } from "@/components/sections/FeaturedVillas";
import { OurAmenities } from "@/components/sections/OurAmenities";
import { LocationHighlight } from "@/components/sections/LocationHighlight";
import { FAQ } from "@/components/sections/FAQ";
import { InstagramFeed } from "@/components/sections/InstagramFeed";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutExperience />
      <FeaturedVillas />
      <OurAmenities />
      <LocationHighlight />
      <FAQ />
      <InstagramFeed />
      <CTASection />
    </>
  );
}

import { Container } from "@/components/shared/Container";
import { VillaMap } from "@/components/features/villas/VillaMap";
import { MapPin, Navigation } from "lucide-react";

export function LocationHighlight() {
  return (
    <section className="py-24 bg-[#F7F6F2]">
      <Container>
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold text-[#3A4A1F] tracking-tight">
              Strategically Located
            </h2>
            <p className="text-lg text-gray-700 font-light">
              Nestled in the prime areas of Sleman and Seturan, Lodjisvarga offers unparalleled access to Yogyakarta&apos;s finest culinary spots, cultural landmarks, and shopping destinations, all while maintaining absolute privacy.
            </p>

            <ul className="space-y-4 pt-4">
              <li className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-[#A8BFA3]/30 flex items-center justify-center shrink-0">
                  <MapPin className="text-[#3A4A1F] w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">15 Min to Malioboro</h4>
                  <p className="text-sm text-gray-500 font-light">The heart of Yogyakarta&apos;s cultural hub.</p>
                </div>
              </li>
              <li className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-[#A8BFA3]/30 flex items-center justify-center shrink-0">
                  <MapPin className="text-[#3A4A1F] w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">10 Min to Adisutjipto Airport</h4>
                  <p className="text-sm text-gray-500 font-light">Seamless arrival and departure.</p>
                </div>
              </li>
              <li className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-[#A8BFA3]/30 flex items-center justify-center shrink-0">
                  <MapPin className="text-[#3A4A1F] w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A]">5 Min to Premium Dining</h4>
                  <p className="text-sm text-gray-500 font-light">Surrounded by highly-rated restaurants and cafes.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="flex-1 w-full min-h-[450px] rounded-[3rem] overflow-hidden bg-gray-200 relative shadow-xl border-4 border-white">
            {/* The existing VillaMap is standard placeholder, let's wrap it in a nice UI mask */}
            <div className="absolute inset-0 z-0">
                <VillaMap />
            </div>
            
            {/* Small interactive chip */}
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-[#3A4A1F] hover:bg-white transition-colors cursor-pointer">
                <Navigation className="w-4 h-4" />
                Get Directions
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

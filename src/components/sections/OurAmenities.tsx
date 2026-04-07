import { Container } from "@/components/shared/Container";
import { Waves, UtensilsCrossed, ConciergeBell, Wifi } from "lucide-react";

export function OurAmenities() {
  const amenities = [
    { icon: Waves, title: "Private Pool", desc: "Your own crystal-clear oasis." },
    { icon: UtensilsCrossed, title: "Floating Breakfast", desc: "Start your day in style." },
    { icon: ConciergeBell, title: "24/7 Butler", desc: "Personalized service around the clock." },
    { icon: Wifi, title: "High-speed WiFi", desc: "Stay connected in paradise." },
  ];

  return (
    <section className="py-24 bg-white">
      <Container>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-[#3A4A1F] text-4xl font-bold mb-4 tracking-tight">Signature Amenities</h2>
          <p className="text-gray-600 font-light text-lg">Elevating your stay with exquisite facilities designed for absolute comfort and convenience.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {amenities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-[#A8BFA3]/10 rounded-3xl p-8 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#A8BFA3]/30">
                  <Icon className="text-[#3A4A1F] w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 font-light">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

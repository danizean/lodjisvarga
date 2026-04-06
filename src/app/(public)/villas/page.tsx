import type { Metadata } from "next";
// import { getVillas } from "@/lib/queries/villas";
// import { VillaCard } from "@/components/features/villas/VillaCard";

export const metadata: Metadata = {
  title: "Our Villas",
  description: "Browse our collection of luxury villas. Filter by location, amenities, and availability.",
};

export default async function VillasPage() {
  // const villas = await getVillas();
  return (
    <div>
      {/* TODO: Villa listing with SSR + filter */}
    </div>
  );
}

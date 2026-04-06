import type { Metadata } from "next";
// import { getVillaBySlug } from "@/lib/queries/villas";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // const villa = await getVillaBySlug(slug);
  return {
    title: slug, // Replace with villa.name
    description: "Luxury villa details and booking.",
  };
}

export default async function VillaDetailPage({ params }: Props) {
  const { slug } = await params;
  // const villa = await getVillaBySlug(slug);
  return (
    <div>
      {/* TODO: Villa gallery, amenities, map, booking form */}
    </div>
  );
}

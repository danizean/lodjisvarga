import { Container } from "@/components/shared/Container";
// import { VillaCard } from "@/components/features/villas/VillaCard";
// import { getFeaturedVillas } from "@/lib/queries/villas";

export async function FeaturedVillas() {
  // const villas = await getFeaturedVillas();
  return (
    <section className="py-24">
      <Container>
        <h2 className="text-3xl font-bold mb-12">Featured Villas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* TODO: Map villas to VillaCard */}
        </div>
      </Container>
    </section>
  );
}

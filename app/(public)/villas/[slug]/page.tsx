// app/(public)/villas/[slug]/page.tsx
import { getVillaDetail } from "@/lib/queries/villas";
import { notFound } from "next/navigation";
import VillaGallery from "@/components/features/villas/VillaGallery";
import BookingForm from "@/components/features/booking/BookingForm";

export default async function VillaDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const villa = await getVillaDetail(params.slug);

  if (!villa) notFound();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{villa.name}</h1>
      <p className="text-slate-500 mb-6 flex items-center gap-2">
        {villa.address}
      </p>

      <VillaGallery images={villa.gallery} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tentang Villa</h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {villa.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Fasilitas Utama</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {villa.villa_amenities.map((item: any) => (
                <div
                  key={item.amenities.id}
                  className="flex items-center gap-2 p-3 border rounded-xl"
                >
                  <span className="text-sm">{item.amenities.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div>
          <BookingForm villa={villa} />
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { Container } from "@/components/shared/Container";
import { MapPin, Phone, BedDouble, Users, ChevronLeft } from "lucide-react";
import { generateWhatsAppLink, generateBookingWhatsAppMessage } from "@/lib/services/whatsapp";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── generateMetadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: villa } = await supabase
    .from("villas")
    .select("name, description, address")
    .eq("slug", slug)
    .single();

  if (!villa) return { title: "Villa Not Found" };

  return {
    title: villa.name,
    description: villa.description ?? `Temukan keindahan ${villa.name} di ${villa.address}.`,
  };
}

// ── generateStaticParams ──────────────────────────────────────────
export async function generateStaticParams() {
  // Gunakan client tanpa cookies — generateStaticParams berjalan saat build time
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("villas").select("slug").eq("status", "active");
  return (data ?? []).map((v) => ({ slug: v.slug }));
}

const formatIDR = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

// ── Page ──────────────────────────────────────────────────────────────────
export default async function VillaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: villa, error } = await supabase
    .from("villas")
    .select(`
      id, name, slug, description, address, gmaps_url, whatsapp_number, status,
      room_types (
        id, name, base_price, capacity_adult, capacity_child, description,
        gallery (image_url, is_primary, display_order)
      ),
      villa_amenities (
        amenities (id, name, icon_name)
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !villa) notFound();

  const isComingSoon = villa.status === "coming_soon";

  // Collect all photos across all room types for the hero gallery
  const allPhotos = villa.room_types.flatMap((rt) =>
    [...rt.gallery].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)).map((g) => ({
      url: g.image_url,
      roomName: rt.name,
    }))
  );

  const heroPhoto = allPhotos.find((p) => p.url) ?? null;

  return (
    <>
      {/* ── Hero ── */}
      <div className="relative h-[60vh] min-h-[400px] bg-gray-900">
        {heroPhoto ? (
          <Image
            src={heroPhoto.url}
            alt={villa.name}
            fill
            className="object-cover opacity-70"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#3A4A1F] to-[#1a2510]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/#featured-villas"
            className="flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </Link>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <Container>
            {isComingSoon && (
              <span className="inline-block mb-3 text-[10px] font-bold tracking-widest uppercase text-white/80 border border-white/40 px-3 py-1 rounded-full">
                Segera Hadir
              </span>
            )}
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-2">{villa.name}</h1>
            {villa.address && (
              <p className="text-white/80 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {villa.address}
              </p>
            )}
          </Container>
        </div>
      </div>

      {/* ── Content ── */}
      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: Description + Rooms ──────────────────────── */}
          <div className="lg:col-span-2 space-y-12">

            {/* About */}
            {villa.description && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-4">Tentang {villa.name}</h2>
                <p className="text-gray-600 leading-relaxed">{villa.description}</p>
              </section>
            )}

            {/* Room Types */}
            {villa.room_types.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Tipe Kamar</h2>
                <div className="space-y-5">
                  {villa.room_types.map((rt) => {
                    const primaryImg =
                      rt.gallery.find((g) => g.is_primary)?.image_url ?? rt.gallery[0]?.image_url;
                    const waMsg = generateBookingWhatsAppMessage({
                      villaName: villa.name,
                      roomTypeName: rt.name,
                      guestName: "Saya",
                      checkIn: new Date(),
                      checkOut: new Date(Date.now() + 86400000),
                      guests: rt.capacity_adult ?? 2,
                    });
                    const waLink = generateWhatsAppLink(waMsg, villa.whatsapp_number ?? undefined);

                    return (
                      <div
                        key={rt.id}
                        className="group flex gap-5 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-[#3A4A1F]/20"
                      >
                        {/* Thumbnail */}
                        <div className="relative w-32 h-28 rounded-xl overflow-hidden flex-shrink-0">
                          {primaryImg ? (
                            <Image
                              src={primaryImg}
                              alt={rt.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="128px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <BedDouble className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">{rt.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                            {rt.description ?? `Unit eksklusif untuk kenyamanan Anda.`}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-[#3A4A1F]" />
                              {rt.capacity_adult ?? 2} Dewasa
                              {(rt.capacity_child ?? 0) > 0 && ` · ${rt.capacity_child} Anak`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xl font-bold text-[#3A4A1F]">{formatIDR(rt.base_price)}</span>
                              <span className="text-xs text-gray-400 ml-1">/malam</span>
                            </div>
                            {!isComingSoon && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-white bg-[#25D366] hover:bg-[#128C7E] px-3 py-1.5 rounded-lg transition-colors"
                              >
                                Pesan Kamar
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Photo Gallery */}
            {allPhotos.length > 1 && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Galeri Foto</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allPhotos.map((p, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                      <Image
                        src={p.url}
                        alt={p.roomName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[10px] font-medium truncate">{p.roomName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Sticky Sidebar ──────────────────────────── */}
          <aside className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24 space-y-5">
              <h3 className="font-serif text-lg font-bold text-gray-900">Hubungi Kami</h3>

              {villa.whatsapp_number && (
                <a
                  href={generateWhatsAppLink(
                    `Halo, saya ingin menanyakan informasi tentang ${villa.name}.`,
                    villa.whatsapp_number
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-[#25D366] text-white font-bold text-sm transition-all hover:bg-[#128C7E]"
                >
                  <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z"/>
                  </svg>
                  Chat via WhatsApp
                </a>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-3">
                {villa.address && (
                  <div className="flex gap-2.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-[#3A4A1F] flex-shrink-0 mt-0.5" />
                    <p>{villa.address}</p>
                  </div>
                )}
                {villa.whatsapp_number && (
                  <div className="flex gap-2.5 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-[#3A4A1F] flex-shrink-0" />
                    <p>+{villa.whatsapp_number}</p>
                  </div>
                )}
              </div>

              {/* Google Maps Embed */}
              {villa.gmaps_url && (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <iframe
                    src={villa.gmaps_url.replace("/maps/", "/maps/embed?pb=").includes("embed") 
                      ? villa.gmaps_url 
                      : `https://maps.google.com/maps?q=${encodeURIComponent(villa.address ?? villa.name)}&output=embed`}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Peta lokasi ${villa.name}`}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}

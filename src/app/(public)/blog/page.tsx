import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Rss } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import { getPublishedArticles } from "@/lib/queries/blog";
import { SITE_NAME, SITE_URL, WA_NUMBER } from "@/lib/constants/site";

// ─── ISR: re-generate every 60 s ─────────────────────────────────────────────
export const revalidate = 60;

// ─── Metadata ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Blog",
  description: `Tips wisata, panduan villa, dan inspirasi menginap mewah di Yogyakarta — dari ${SITE_NAME}.`,
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: "Tips wisata, panduan villa, dan inspirasi liburan mewah di Jogja.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPage() {
  const { data: articles, total } = await getPublishedArticles({ page: 1, limit: 12 });

  const [featured, ...rest] = articles;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#3A4A1F] pt-32 pb-20 md:pt-40 md:pb-28">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#D4AF37]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#D4AF37]/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
        </div>

        <Container className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <Rss className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/80">
              Lodjisvarga Journal
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight">
            Tips &amp;{" "}
            <span className="italic text-[#D4AF37]">Inspirasi</span>
            <br className="hidden md:block" />
            {" "}Liburan di Jogja
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm md:text-base text-white/60 leading-relaxed">
            Panduan wisata, rekomendasi villa, dan cerita di balik pengalaman
            menginap eksklusif bersama Lodjisvarga.
          </p>

          {total > 0 && (
            <p className="mt-4 text-[11px] font-medium text-white/40">
              {total} artikel tersedia
            </p>
          )}
        </Container>
      </section>

      {/* ── Article Grid ── */}
      <section className="bg-[#F7F6F2] py-16 pb-28">
        <Container className="max-w-6xl">

          {articles.length === 0 ? (
            /* ── Empty state ── */
            <div className="py-28 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-[#3A4A1F]/5 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-[#3A4A1F]/20" />
              </div>
              <p className="font-serif text-xl font-bold text-[#3A4A1F]">
                Belum ada artikel
              </p>
              <p className="text-gray-400 text-sm">
                Artikel pertama sedang disiapkan. Kunjungi kembali sebentar lagi.
              </p>
              <Link
                href="/villas"
                className="inline-block mt-4 rounded-full bg-[#3A4A1F] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#2A3A1F] transition"
              >
                Lihat Villa Kami
              </Link>
            </div>

          ) : (
            <div className="space-y-16 lg:space-y-24">

              {/* Featured article (first, larger) */}
              {featured && (
                <div>
                  <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
                    Artikel Unggulan
                  </p>
                  <ArticleCard article={featured} featured />
                </div>
              )}

              {/* Rest of articles — 3-column grid */}
              {rest.length > 0 && (
                <div>
                  <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.4em] text-[#3A4A1F]/50">
                    Artikel Terbaru
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {rest.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </Container>
      </section>

      {/* ── Blog CTA ── */}
      <section className="bg-white py-20 border-t border-gray-100">
        <Container className="max-w-3xl text-center space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
            Siap Liburan?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#3A4A1F] leading-tight">
            Wujudkan Pengalaman{" "}
            <span className="italic text-[#D4AF37]">Menginap Eksklusif</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            Cek ketersediaan villa dan dapatkan rekomendasi terbaik untuk
            liburan Anda di Yogyakarta.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/${WA_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent("Halo Lodjisvarga, saya ingin cek ketersediaan villa.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#128C7E] transition"
            >
              {/* WhatsApp icon */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
              </svg>
              Cek via WhatsApp
            </a>
            <Link
              href="/villas"
              className="inline-flex items-center gap-2 rounded-full border border-[#3A4A1F]/30 px-7 py-3 text-sm font-bold text-[#3A4A1F] hover:bg-[#3A4A1F] hover:text-white transition"
            >
              Lihat Semua Villa
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

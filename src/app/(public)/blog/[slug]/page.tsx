import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowLeft, ChevronRight } from "lucide-react";

import { Container } from "@/components/shared/Container";
import { TipTapRenderer } from "@/components/features/blog/TipTapRenderer";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import { getArticleBySlug, getPublishedSlugs, getRelatedArticles } from "@/lib/queries/blog";
import { formatDate } from "@/lib/utils/format";
import { SITE_NAME, SITE_URL, WA_NUMBER } from "@/lib/constants/site";

// ─── ISR config ───────────────────────────────────────────────────────────────
export const revalidate = 60;

// ─── Static params (pre-rendered at build time) ───────────────────────────────
export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

// ─── Page props ───────────────────────────────────────────────────────────────
interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic metadata (SSR-SEO) ───────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan" };
  }

  const ogImage = article.thumbnail_url
    ? [{ url: article.thumbnail_url, width: 1200, height: 630, alt: article.title }]
    : [];

  return {
    title: article.title,
    description: article.meta_description ?? article.excerpt ?? undefined,
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.meta_description ?? article.excerpt ?? undefined,
      url: `${SITE_URL}/blog/${slug}`,
      type: "article",
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      authors: [SITE_NAME],
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.meta_description ?? article.excerpt ?? undefined,
      images: ogImage.map((img) => img.url),
    },
  };
}

// ─── JSON-LD builder ──────────────────────────────────────────────────────────
function buildJsonLd(article: NonNullable<Awaited<ReturnType<typeof getArticleBySlug>>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description ?? article.excerpt ?? "",
    image: article.thumbnail_url ?? `${SITE_URL}/assets/og-default.jpg`,
    datePublished: article.published_at ?? article.created_at ?? new Date().toISOString(),
    dateModified: article.updated_at ?? article.published_at ?? new Date().toISOString(),
    url: `${SITE_URL}/blog/${article.slug}`,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${article.slug}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  // Parallel data fetch: article + related articles
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles({
    currentSlug: article.slug,
    category: article.category,
    limit: 3,
  });

  const publishedDate = article.published_at
    ? formatDate(new Date(article.published_at))
    : null;

  const updatedDate = article.updated_at
    ? formatDate(new Date(article.updated_at))
    : null;

  return (
    <>
      {/* ── JSON-LD Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(article)) }}
      />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100 pt-24 pb-0">
        <Container className="max-w-4xl">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-3 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#3A4A1F] transition">Beranda</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-[#3A4A1F] transition">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-medium line-clamp-1">{article.title}</span>
          </nav>
        </Container>
      </div>

      {/* ── Article Hero ── */}
      <header className="bg-white pb-0">
        <Container className="max-w-4xl pt-8 pb-10">

          {/* Category */}
          {article.category && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3A4A1F]/10 text-[#3A4A1F] text-[10px] font-bold uppercase tracking-widest border border-[#3A4A1F]/15">
                <Tag className="w-2.5 h-2.5" />
                {article.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-5">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-2xl">
              {article.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-400 pb-6 border-b border-gray-100">
            <span className="text-[#3A4A1F] font-bold text-sm">{SITE_NAME}</span>

            {publishedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Diterbitkan {publishedDate}
              </span>
            )}

            {updatedDate && updatedDate !== publishedDate && (
              <span className="flex items-center gap-1.5 text-gray-300">
                Diperbarui {updatedDate}
              </span>
            )}

            {article.read_time_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.read_time_minutes} menit baca
              </span>
            )}
          </div>
        </Container>

        {/* Hero thumbnail */}
        {article.thumbnail_url && (
          <div className="relative w-full aspect-[16/7] max-h-[520px] overflow-hidden bg-gray-100">
            <Image
              src={article.thumbnail_url}
              alt={article.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            {/* gradient overlay at bottom for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/60 to-transparent" />
          </div>
        )}
      </header>

      {/* ── Article Body ── */}
      <main className="bg-white py-12">
        <Container className="max-w-4xl">

          {/* TipTap content (SSR-rendered) */}
          <TipTapRenderer content={article.content} />

          {/* ── Tags footer ── */}
          {article.category && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <span className="text-xs text-gray-400">Kategori:</span>{" "}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {article.category}
              </span>
            </div>
          )}

        </Container>
      </main>

      {/* ── CTA Section ── */}
      <section className="bg-[#3A4A1F] py-16 md:py-20">
        <Container className="max-w-3xl text-center space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37]">
            Siap Menginap?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
            Temukan Villa Impian{" "}
            <span className="italic text-[#D4AF37]">Anda di Jogja</span>
          </h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Liburan terbaik dimulai dari pilihan villa yang tepat.
            Cek ketersediaan dan harga terbaik langsung via WhatsApp sekarang.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WA_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo Lodjisvarga, saya tertarik setelah membaca artikel "${article.title}". Boleh saya cek ketersediaan villa?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#128C7E] transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z" />
              </svg>
              Cek Ketersediaan via WhatsApp
            </a>
            <Link
              href="/villas"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition"
            >
              Lihat Semua Villa
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Related Articles ── */}
      {related.length > 0 && (
        <section className="bg-[#F7F6F2] py-16 pb-24">
          <Container className="max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37] mb-1">
                  Baca Juga
                </p>
                <h2 className="font-serif text-2xl font-bold text-[#3A4A1F]">
                  Artikel Terkait
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#3A4A1F]/60 hover:text-[#3A4A1F] transition group"
              >
                Semua Artikel
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {related.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>

            {/* Mobile "all articles" link */}
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/blog"
                className="inline-block rounded-full border border-[#3A4A1F]/20 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#3A4A1F] hover:bg-[#3A4A1F] hover:text-white transition"
              >
                Semua Artikel
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* ── Back to blog ── */}
      <div className="bg-[#F7F6F2] py-6 border-t border-gray-200">
        <Container className="max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#3A4A1F]/60 hover:text-[#3A4A1F] transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
            Kembali ke Blog
          </Link>
        </Container>
      </div>
    </>
  );
}

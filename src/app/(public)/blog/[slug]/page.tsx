import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar, Clock, Tag, ArrowLeft,
  ChevronRight, BookOpen, MessageCircle,
} from "lucide-react";

import { Container } from "@/components/shared/Container";
import { TipTapRenderer } from "@/components/features/blog/TipTapRenderer";
import { ArticleCard } from "@/components/features/blog/ArticleCard";
import {
  getArticleBySlug,
  getPublishedSlugs,
  getRelatedArticles,
} from "@/lib/queries/blog";
import { formatDate } from "@/lib/utils/format";
import { SITE_NAME, SITE_URL, WA_NUMBER } from "@/lib/constants/site";

// ─── ISR config ───────────────────────────────────────────────────────────────
export const revalidate = 60;

// ─── Static params ────────────────────────────────────────────────────────────
export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Artikel Tidak Ditemukan" };

  const ogImage = article.thumbnail_url
    ? [{ url: article.thumbnail_url, width: 1200, height: 630, alt: article.title }]
    : [];

  return {
    title: article.title,
    description: article.meta_description ?? article.excerpt ?? undefined,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
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
      images: ogImage.map((i) => i.url),
    },
  };
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
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
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${article.slug}` },
  };
}

// ─── Inline WhatsApp CTA (used twice — mid-article + footer) ─────────────────
function WaButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center gap-2.5
        rounded-full bg-[#25D366] px-6 py-3
        text-sm font-bold text-white
        shadow-md hover:bg-[#22c55e] hover:shadow-lg
        transition-all duration-200 hover:-translate-y-0.5
      "
    >
      {/* WhatsApp icon */}
      <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.094.541 4.061 1.488 5.773L.057 23.998l6.375-1.406A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 0 1-5.006-1.368l-.358-.214-3.724.977.993-3.62-.234-.371A9.818 9.818 0 0 1 2.182 12C2.182 6.573 6.573 2.182 12 2.182S21.818 6.573 21.818 12 17.427 21.818 12 21.818z"/>
      </svg>
      {label}
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

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

  const waText = encodeURIComponent(
    `Halo Lodjisvarga, saya tertarik setelah membaca artikel "${article.title}". Boleh saya cek ketersediaan villa?`
  );
  const waHref = `https://wa.me/${WA_NUMBER.replace(/\D/g, "")}?text=${waText}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(article)) }}
      />

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 pt-24">
        <Container className="max-w-[900px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 py-3 text-[11px] text-gray-400">
            <Link href="/" className="hover:text-[#3A4A1F] transition-colors">Beranda</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <Link href="/blog" className="hover:text-[#3A4A1F] transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-600 font-medium truncate">{article.title}</span>
          </nav>
        </Container>
      </div>

      {/* ── Article header ────────────────────────────────────────────────── */}
      <header className="bg-white">
        <Container className="max-w-[900px] pt-10 pb-8 md:pt-16 md:pb-10">

          {/* Category + read time — top meta row */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            {article.category && (
              <span className="
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                bg-[#3A4A1F]/[0.08] text-[#3A4A1F] text-[10px] font-bold
                uppercase tracking-[0.15em] border border-[#3A4A1F]/[0.12]
              ">
                <Tag className="w-2.5 h-2.5" />
                {article.category}
              </span>
            )}
            {article.read_time_minutes && (
              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                <Clock className="w-3 h-3" />
                {article.read_time_minutes} menit baca
              </span>
            )}
          </div>

          {/* Title — large serif, tight leading */}
          <h1 className="
            font-serif font-bold text-gray-900 leading-[1.15]
            text-[1.875rem] sm:text-[2.375rem] md:text-[2.875rem]
            mb-5 max-w-[820px]
          ">
            {article.title}
          </h1>

          {/* Lead / excerpt */}
          {article.excerpt && (
            <p className="
              text-gray-500 text-base sm:text-[1.0625rem] leading-[1.75]
              mb-7 max-w-[640px]
            ">
              {article.excerpt}
            </p>
          )}

          {/* Byline bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
            <div className="flex items-center gap-3">
              {/* Author avatar */}
              <div className="w-9 h-9 rounded-full bg-[#3A4A1F] flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#3A4A1F] leading-none">{SITE_NAME}</p>
                {publishedDate && (
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {publishedDate}
                  </p>
                )}
              </div>
            </div>

            {/* Inline micro-CTA — natural, not pushy */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="
                hidden sm:inline-flex items-center gap-1.5
                text-[11px] font-bold text-[#3A4A1F]/60
                hover:text-[#3A4A1F] transition-colors
                border border-[#3A4A1F]/20 rounded-full px-3 py-1.5
                hover:border-[#3A4A1F]/40 hover:bg-[#3A4A1F]/[0.04]
              "
            >
              <MessageCircle className="w-3 h-3" />
              Tanya Villa
            </a>
          </div>

          {/* ── Hero image ── */}
          {article.thumbnail_url && (
            <div className="relative w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm mt-4 mb-8" style={{ aspectRatio: "21/9", maxHeight: "60vh" }}>
              <Image
                src={article.thumbnail_url}
                alt={article.title}
                fill
                sizes="(max-width: 900px) 100vw, 900px"
                className="object-cover"
                priority
              />
            </div>
          )}
          
          <div className="w-full h-px bg-gray-100" />
        </Container>
      </header>

      {/* ── Article body ──────────────────────────────────────────────────── */}
      <main className="bg-white">
        <Container className="max-w-[900px]">
          {/*
            720px is the proven optimal prose width for long-form reading.
            Centered in the 900px container leaves comfortable breathing room
            on sides, especially on 13–14" laptop screens.
          */}
          <div className="mx-auto max-w-[720px] py-12 md:py-14">

            <TipTapRenderer
              content={article.content}
              className="article-prose"
            />

            {/* ── Inline conversion nudge — feels natural after reading ── */}
            <div className="
              mt-14 p-6 rounded-2xl
              bg-gradient-to-br from-[#3A4A1F]/[0.04] to-[#D4AF37]/[0.05]
              border border-[#3A4A1F]/[0.1]
            ">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">
                Siap Liburan?
              </p>
              <p className="font-serif text-lg font-bold text-[#2A3A10] mb-1">
                Temukan villa impian Anda di Yogyakarta
              </p>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                Cek ketersediaan langsung dan dapatkan penawaran terbaik via WhatsApp.
              </p>
              <div className="flex flex-wrap gap-3">
                <WaButton href={waHref} label="Cek Ketersediaan" />
                <Link
                  href="/villas"
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full border border-[#3A4A1F]/25
                    px-6 py-3 text-sm font-bold text-[#3A4A1F]
                    hover:bg-[#3A4A1F] hover:text-white hover:border-[#3A4A1F]
                    transition-all duration-200
                  "
                >
                  Lihat Semua Villa
                </Link>
              </div>
            </div>

            {/* ── Article footer ── */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              {article.category && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Kategori:</span>
                  <Link
                    href={`/blog?category=${encodeURIComponent(article.category.toLowerCase())}`}
                    className="
                      inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                      bg-gray-100 text-gray-600 text-xs font-semibold
                      hover:bg-[#3A4A1F]/10 hover:text-[#3A4A1F] transition-colors
                    "
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {article.category}
                  </Link>
                </div>
              )}
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3A4A1F]/50 hover:text-[#3A4A1F] transition-colors group"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
                Kembali ke Blog
              </Link>
            </div>
          </div>
        </Container>
      </main>

      {/* ── Full CTA section ──────────────────────────────────────────────── */}
      <section className="relative bg-[#3A4A1F] py-20 md:py-24 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#D4AF37]/[0.07] blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <Container className="max-w-3xl text-center relative z-10 space-y-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#D4AF37]">
            Wujudkan Pengalaman Menginap
          </p>
          <h2 className="font-serif text-[1.875rem] md:text-[2.5rem] font-bold text-white leading-[1.2]">
            Liburan Tak Terlupakan{" "}
            <span className="italic text-[#D4AF37]">Dimulai di Sini</span>
          </h2>
          <p className="text-white/55 text-sm md:text-[1rem] leading-relaxed max-w-md mx-auto">
            Villa eksklusif di Yogyakarta dengan pemandangan dan fasilitas premium.
            Booking sekarang dan nikmati pengalaman menginap yang berbeda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <WaButton href={waHref} label="Cek Ketersediaan via WhatsApp" />
            <Link
              href="/villas"
              className="
                inline-flex items-center gap-2
                rounded-full border border-white/25 px-7 py-3
                text-sm font-bold text-white
                hover:bg-white/10 hover:border-white/40
                transition-all duration-200
              "
            >
              Lihat Semua Villa
            </Link>
          </div>
        </Container>
      </section>

      {/* ── Related articles ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-[#F7F6F2] py-16 pb-24">
          <Container className="max-w-6xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37] mb-1.5">
                  Baca Juga
                </p>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#3A4A1F]">
                  Artikel Terkait
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#3A4A1F]/50 hover:text-[#3A4A1F] transition-colors group"
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

            <div className="mt-8 text-center sm:hidden">
              <Link href="/blog" className="inline-block rounded-full border border-[#3A4A1F]/20 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#3A4A1F] hover:bg-[#3A4A1F] hover:text-white transition">
                Semua Artikel
              </Link>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

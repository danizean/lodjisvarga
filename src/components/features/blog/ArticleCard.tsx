import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, Tag, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import type { ArticleListing } from "@/lib/queries/blog";

// ─── Placeholder ──────────────────────────────────────────────────────────────
const PLACEHOLDER = "/images/hero-villa.jpg";

// ─── Category badge colors ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  tips: "bg-emerald-50 text-emerald-700 border-emerald-200",
  wisata: "bg-blue-50 text-blue-700 border-blue-200",
  villa: "bg-amber-50 text-amber-700 border-amber-200",
  lifestyle: "bg-purple-50 text-purple-700 border-purple-200",
  kuliner: "bg-orange-50 text-orange-700 border-orange-200",
};

function getCategoryStyle(category: string | null): string {
  if (!category) return "bg-gray-50 text-gray-600 border-gray-200";
  return CATEGORY_COLORS[category.toLowerCase()] ?? "bg-[#3A4A1F]/10 text-[#3A4A1F] border-[#3A4A1F]/20";
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ArticleCardProps {
  article: ArticleListing;
  /** When true, renders as a featured (larger) horizontal card */
  featured?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const href = `/blog/${article.slug}`;
  const publishedDate = article.published_at
    ? formatDate(new Date(article.published_at))
    : null;

  return (
    <article
      className={`
        group flex flex-col h-full
        bg-white rounded-2xl overflow-hidden
        border border-[#3A4A1F]/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]
        hover:shadow-[0_8px_30px_rgba(58,74,31,0.08)] hover:-translate-y-1
        transition-all duration-500 ease-out
        ${featured ? "md:flex-row" : ""}
      `}
    >
      {/* ── Thumbnail ── */}
      <Link
        href={href}
        className={`
          relative overflow-hidden flex-shrink-0 bg-gray-100
          ${featured ? "md:w-2/5 aspect-[4/3] md:aspect-auto" : "aspect-[16/10]"}
        `}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={article.thumbnail_url ?? PLACEHOLDER}
          alt={article.title}
          fill
          sizes={featured
            ? "(max-width: 768px) 100vw, 40vw"
            : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority={featured}
        />

        {/* Category badge overlay */}
        {article.category && (
          <div className="absolute top-4 left-4">
            <span
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                text-[10px] font-bold uppercase tracking-widest
                backdrop-blur-md shadow-sm border
                ${getCategoryStyle(article.category)}
              `}
            >
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className={`flex flex-col flex-1 ${featured ? "p-6 md:p-8 lg:p-9" : "p-6"}`}>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium tracking-wide uppercase mb-4">
          {publishedDate && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {publishedDate}
            </span>
          )}
          {article.read_time_minutes && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.read_time_minutes} min read
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <Link href={href} className="block mb-3">
          <h2
            className={`
              font-serif font-bold text-[#3A4A1F] leading-snug
              group-hover:text-[#D4AF37] transition-colors duration-300
              ${featured ? "text-2xl md:text-3xl" : "text-xl line-clamp-2"}
            `}
          >
            {article.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {article.excerpt ? (
          <p
            className={`
              text-gray-500 text-sm leading-relaxed flex-1
              ${featured ? "line-clamp-3 md:line-clamp-4 mb-6 md:text-base" : "line-clamp-3 mb-6"}
            `}
          >
            {article.excerpt}
          </p>
        ) : (
          <div className="flex-1 mb-6" />
        )}

        {/* CTA link */}
        <div className="mt-auto pt-5 border-t border-[#3A4A1F]/5">
          <Link
            href={href}
            className="
              inline-flex items-center gap-2
              text-xs font-bold uppercase tracking-[0.2em]
              text-[#3A4A1F] hover:text-[#D4AF37]
              transition-colors duration-300
              group/link
            "
          >
            Baca Selengkapnya
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1.5" />
          </Link>
        </div>

      </div>
    </article>
  );
}

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
        group flex flex-col
        bg-white rounded-2xl overflow-hidden
        border border-gray-100 shadow-sm
        hover:shadow-xl hover:-translate-y-1.5
        transition-all duration-400
        ${featured ? "md:flex-row" : ""}
      `}
    >
      {/* ── Thumbnail ── */}
      <Link
        href={href}
        className={`
          relative overflow-hidden flex-shrink-0
          ${featured ? "md:w-2/5 h-56 md:h-auto" : "h-52"}
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
            : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority={featured}
        />

        {/* Category badge overlay */}
        {article.category && (
          <div className="absolute top-3 left-3">
            <span
              className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                text-[10px] font-bold uppercase tracking-widest
                border backdrop-blur-sm
                ${getCategoryStyle(article.category)}
              `}
            >
              <Tag className="w-2.5 h-2.5" />
              {article.category}
            </span>
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-5 md:p-6">

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
          {publishedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {publishedDate}
            </span>
          )}
          {article.read_time_minutes && (
            <>
              <span className="h-1 w-1 rounded-full bg-gray-200" />
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.read_time_minutes} menit baca
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <Link href={href}>
          <h2
            className={`
              font-serif font-bold text-gray-900 leading-snug
              group-hover:text-[#3A4A1F] transition-colors duration-200
              line-clamp-2
              ${featured ? "text-xl md:text-2xl mb-3" : "text-lg mb-2"}
            `}
          >
            {article.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p
            className={`
              text-gray-500 text-sm leading-relaxed flex-1
              ${featured ? "line-clamp-4 mb-5" : "line-clamp-3 mb-5"}
            `}
          >
            {article.excerpt}
          </p>
        )}

        {/* CTA link */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <Link
            href={href}
            className="
              inline-flex items-center gap-1.5
              text-xs font-bold uppercase tracking-widest
              text-[#3A4A1F] hover:text-[#D4AF37]
              transition-colors duration-200
              group/link
            "
          >
            Baca Selengkapnya
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
        </div>

      </div>
    </article>
  );
}

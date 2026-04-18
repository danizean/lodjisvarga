import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArticleForm } from "@/components/features/blog/ArticleForm";
import { getAdminArticleById } from "@/lib/queries/blog";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getAdminArticleById(id);
  return {
    title: article ? `Edit: ${article.title}` : "Edit Artikel",
  };
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getAdminArticleById(id);

  if (!article) notFound();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-700" title="Kembali">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 truncate">{article.title}</h1>
            <Badge
              variant={article.is_published ? "default" : "outline"}
              className={article.is_published
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "text-gray-500 border-gray-300"
              }
            >
              {article.is_published ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">/blog/{article.slug}</p>
        </div>

        {/* View live link */}
        {article.is_published && (
          <a
            href={`/blog/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0">
              <ExternalLink className="w-3.5 h-3.5" />
              Lihat Artikel
            </Button>
          </a>
        )}
      </div>

      {/* ── Form pre-filled with DB values ── */}
      <ArticleForm
        articleId={article.id}
        defaultValues={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? undefined,
          meta_description: article.meta_description ?? undefined,
          thumbnail_url: article.thumbnail_url ?? undefined,
          category: article.category ?? undefined,
          read_time_minutes: article.read_time_minutes ?? undefined,
          content: article.content,
          is_published: article.is_published,
        }}
      />

    </div>
  );
}

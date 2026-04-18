import { getAdminArticles } from "@/lib/queries/blog";
import { AdminBlogList } from "@/components/features/blog/AdminBlogList";
import { Plus, BookOpen, FileText, Globe } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const articles = await getAdminArticles();

  const published = articles.filter((a) => a.is_published).length;
  const drafts = articles.filter((a) => !a.is_published).length;

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blog CMS</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tulis, edit, dan kelola artikel blog Lodjisvarga.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#3A4A1F] text-white text-sm font-medium hover:bg-[#2A3A10] transition-colors flex-shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Tulis Artikel
        </Link>
      </div>

      {/* ── Stats strip ── */}
      <div className="flex items-center gap-6 bg-white rounded-xl border border-gray-200 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">{articles.length}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Total Artikel</p>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-emerald-700 tabular-nums leading-none">{published}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Published</p>
          </div>
        </div>

        <div className="w-px h-8 bg-gray-100" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-700 tabular-nums leading-none">{drafts}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Draft</p>
          </div>
        </div>
      </div>

      {/* ── Article table ── */}
      <AdminBlogList initialArticles={articles} />

    </div>
  );
}

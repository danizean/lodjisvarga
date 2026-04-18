"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Edit2, Trash2, Loader2, Eye, EyeOff, Clock,
  Tag, ExternalLink, PenLine, FileText, BookOpen, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteArticle, togglePublish } from "@/lib/actions/blog";
import type { ArticleAdmin } from "@/lib/queries/blog";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(dateStr));
}

const CATEGORY_STYLES: Record<string, string> = {
  tips: "bg-emerald-50 text-emerald-700",
  wisata: "bg-sky-50 text-sky-700",
  villa: "bg-amber-50 text-amber-700",
  lifestyle: "bg-purple-50 text-purple-700",
  kuliner: "bg-orange-50 text-orange-700",
  panduan: "bg-teal-50 text-teal-700",
  inspirasi: "bg-pink-50 text-pink-700",
};

function categoryStyle(cat: string | null) {
  if (!cat) return "bg-gray-100 text-gray-500";
  return CATEGORY_STYLES[cat.toLowerCase()] ?? "bg-gray-100 text-gray-600";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminBlogListProps {
  initialArticles: ArticleAdmin[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminBlogList({ initialArticles }: AdminBlogListProps) {
  const [articles, setArticles] = useState<ArticleAdmin[]>(initialArticles);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  // ── Optimistic toggle ──
  const handleToggle = (article: ArticleAdmin) => {
    setPendingId(article.id);
    startTransition(async () => {
      const next = !article.is_published;
      const id = toast.loading(next ? "Menerbitkan artikel…" : "Menjadikan draft…");
      const res = await togglePublish(article.id, next);
      toast.dismiss(id);
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success(next ? "Artikel diterbitkan" : "Dikembalikan ke draft");
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id
              ? { ...a, is_published: next, published_at: next ? new Date().toISOString() : null }
              : a
          )
        );
      }
      setPendingId(null);
    });
  };

  // ── Delete ──
  const handleDelete = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const toastId = toast.loading("Menghapus artikel…");
      const res = await deleteArticle(id);
      toast.dismiss(toastId);
      if (!res.success) {
        toast.error(res.error);
      } else {
        toast.success("Artikel dihapus");
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
      setPendingId(null);
    });
  };

  // ── Empty state ──
  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
          <BookOpen className="w-5 h-5 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">Belum ada artikel</h3>
        <p className="text-sm text-gray-400 mt-1">Mulai tulis artikel pertama untuk blog Anda.</p>
        <Link
          href="/admin/blog/new"
          className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#3A4A1F] text-white text-sm font-medium hover:bg-[#2A3A10] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Tulis Artikel Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">

      {/* ── Table header ── */}
      <div className="grid grid-cols-[1fr_100px_96px_120px_100px] gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-400 rounded-t-xl">
        <span>Artikel</span>
        <span>Kategori</span>
        <span>Status</span>
        <span>Tanggal</span>
        <span className="text-right">Aksi</span>
      </div>

      {/* ── Rows ── */}
      <div className="divide-y divide-gray-100">
        {articles.map((article, idx) => {
          const isRowPending = isPending && pendingId === article.id;
          const dateStr = article.published_at ?? article.created_at;

          return (
            <div
              key={article.id}
              className={`
                grid grid-cols-[1fr_100px_96px_120px_100px] gap-3 px-5 py-3.5 items-center
                ${idx % 2 === 1 ? "bg-gray-50/40" : "bg-white"}
                hover:bg-blue-50/30 transition-colors duration-100
                ${isRowPending ? "opacity-50 pointer-events-none" : ""}
              `}
            >
              {/* Title */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {article.is_published
                    ? <PenLine className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    : <FileText className="w-3 h-3 text-gray-300 flex-shrink-0" />
                  }
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                    {article.title}
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-gray-400 font-mono truncate pl-5">
                  /blog/{article.slug}
                </p>
              </div>

              {/* Category */}
              <div>
                {article.category ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${categoryStyle(article.category)}`}>
                    <Tag className="w-2.5 h-2.5" />
                    {article.category}
                  </span>
                ) : (
                  <span className="text-gray-300 text-xs">—</span>
                )}
              </div>

              {/* Status */}
              <div>
                {article.is_published ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    Draft
                  </span>
                )}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{dateStr ? formatDate(dateStr) : "—"}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 justify-end">

                {/* View live */}
                {article.is_published && (
                  <a
                    href={`/blog/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Lihat artikel"
                  >
                    <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-700">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}

                {/* Toggle publish */}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={() => handleToggle(article)}
                  disabled={isRowPending}
                  title={article.is_published ? "Jadikan Draft" : "Terbitkan"}
                  className={article.is_published
                    ? "text-amber-500 hover:bg-amber-50"
                    : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                  }
                >
                  {isRowPending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : article.is_published
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye className="w-3.5 h-3.5" />
                  }
                </Button>

                {/* Edit */}
                <Link href={`/admin/blog/${article.id}/edit`}>
                  <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Edit artikel">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger
                    disabled={isRowPending}
                    className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus artikel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus artikel ini?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <strong>&ldquo;{article.title}&rdquo;</strong> akan dihapus secara permanen dan tidak dapat dikembalikan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(article.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

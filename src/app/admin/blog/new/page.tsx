import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleForm } from "@/components/features/blog/ArticleForm";

export const metadata: Metadata = {
  title: "Tulis Artikel Baru | Admin",
};

export default function NewArticlePage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3">
        <Link href="/admin/blog">
          <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-700" title="Kembali">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Artikel Baru</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tulis dan terbitkan konten blog baru.</p>
        </div>
      </div>

      {/* ── Form ── */}
      <ArticleForm />

    </div>
  );
}

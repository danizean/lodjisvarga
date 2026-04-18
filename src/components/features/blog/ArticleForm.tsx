"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Globe, Eye, EyeOff, RefreshCw, AlertCircle, FileText, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { TipTapEditor, type TipTapJSON } from "@/components/features/blog/TipTapEditor";
import { ThumbnailUploader } from "@/components/features/blog/ThumbnailUploader";
import { createArticle, updateArticle, checkSlugAvailability, togglePublish } from "@/lib/actions/blog";
import { slugify } from "@/lib/utils/slug";
import { SLUG_REGEX } from "@/lib/constants/slug";
import type { Json } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArticleFormProps {
  articleId?: string;
  defaultValues?: {
    title?: string;
    slug?: string;
    excerpt?: string;
    meta_description?: string;
    thumbnail_url?: string;
    category?: string;
    read_time_minutes?: number;
    content?: Json | null;
    is_published?: boolean | null;
  };
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  meta_description: string;
  thumbnail_url: string;
  category: string;
  read_time_minutes: string;
  content: TipTapJSON | null;
}

interface FieldError {
  title?: string;
  slug?: string;
  excerpt?: string;
  meta_description?: string;
  thumbnail_url?: string;
  content?: string;
}

type SlugStatus = "idle" | "checking" | "available" | "taken";

const CATEGORIES = ["Tips", "Wisata", "Villa", "Lifestyle", "Kuliner", "Panduan", "Inspirasi"];

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  meta_description: "",
  thumbnail_url: "",
  category: "",
  read_time_minutes: "3",
  content: null,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  );
}

function FieldLabel({ htmlFor, children, required, hint }: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-700">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />{msg}
    </p>
  );
}

function inputCls(hasError?: boolean) {
  return `w-full h-9 px-3 rounded-lg text-sm border outline-none transition-all
    bg-white text-gray-900 placeholder:text-gray-300
    focus:ring-2 focus:ring-[#3A4A1F]/20 focus:border-[#3A4A1F]/60
    ${hasError ? "border-red-300 ring-2 ring-red-100" : "border-gray-200"}`;
}

// ─── Slug status badge ─────────────────────────────────────────────────────────

function SlugBadge({ status }: { status: SlugStatus }) {
  if (status === "checking") return <span className="flex items-center gap-1 text-[10px] text-gray-400"><Loader2 className="w-3 h-3 animate-spin" /> Cek…</span>;
  if (status === "available") return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">✓ Tersedia</span>;
  if (status === "taken") return <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">✗ Dipakai</span>;
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ArticleForm({ articleId, defaultValues }: ArticleFormProps) {
  const id = useId();
  const router = useRouter();
  const isEdit = Boolean(articleId);

  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState<FormState>(() => ({
    title: defaultValues?.title ?? "",
    slug: defaultValues?.slug ?? "",
    excerpt: defaultValues?.excerpt ?? "",
    meta_description: defaultValues?.meta_description ?? "",
    thumbnail_url: defaultValues?.thumbnail_url ?? "",
    category: defaultValues?.category ?? "",
    read_time_minutes: String(defaultValues?.read_time_minutes ?? 3),
    content: (defaultValues?.content as TipTapJSON | null) ?? null,
  }));

  const set = (key: keyof FormState, val: string | TipTapJSON | null) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // ── Slug checking ──
  const checkSlug = useCallback((slug: string) => {
    if (!slug) { setSlugStatus("idle"); return; }
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    setSlugStatus("checking");
    slugDebounceRef.current = setTimeout(async () => {
      const { available } = await checkSlugAvailability(slug, articleId);
      setSlugStatus(available ? "available" : "taken");
    }, 500);
  }, [articleId]);

  useEffect(() => {
    if (slugLocked || isEdit) return;
    const generated = slugify(form.title);
    set("slug", generated);
    checkSlug(generated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, slugLocked]);

  function handleSlugChange(val: string) {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-");
    set("slug", clean);
    checkSlug(clean);
  }

  // ── Submit ──
  function handleSave(publish: boolean) {
    setErrors({});
    startTransition(async () => {
      const toastId = toast.loading(publish ? "Menerbitkan artikel…" : "Menyimpan draft…");
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        meta_description: form.meta_description || undefined,
        thumbnail_url: form.thumbnail_url || undefined,
        category: form.category || undefined,
        read_time_minutes: Number(form.read_time_minutes) || 3,
        content: form.content,
      };

      let result;
      if (isEdit && articleId) {
        result = await updateArticle(articleId, payload);
      } else {
        result = await createArticle(payload);
      }

      toast.dismiss(toastId);

      if (!result.success) {
        toast.error(result.error);
        if ("details" in result && result.details) {
          setErrors(result.details as FieldError);
        }
        return;
      }

      if (publish && !isEdit && result.success && result.data) {
        const { id: newId } = result.data as unknown as { id: string; slug: string };
        await togglePublish(newId, true);
      }

      toast.success(isEdit ? "Artikel diperbarui" : publish ? "Artikel diterbitkan" : "Draft disimpan");
      router.push("/admin/blog");
      router.refresh();
    });
  }

  const isBlocked = isPending || isUploading;
  const metaLen = form.meta_description.length;
  const excerptLen = form.excerpt.length;
  const isPublished = defaultValues?.is_published;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-start">

      {/* ── Left: Main content ── */}
      <div className="space-y-5">

        {/* Title */}
        <SectionCard title="Konten Artikel" description="Judul, URL slug, dan isi artikel.">
          <div>
            <FieldLabel htmlFor={`${id}-title`} required>Judul</FieldLabel>
            <input
              id={`${id}-title`}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Judul artikel yang menarik…"
              className={`${inputCls(Boolean(errors.title))} h-10 text-sm font-semibold`}
            />
            <FieldErr msg={errors.title} />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <label htmlFor={`${id}-slug`} className="block text-xs font-semibold text-gray-700">URL Slug</label>
                <p className="text-[11px] text-gray-400 mt-0.5">Akan menjadi /blog/url-artikel-anda</p>
              </div>
              <div className="flex items-center gap-2">
                <SlugBadge status={slugStatus} />
                <Button
                  variant="ghost"
                  size="xs"
                  type="button"
                  onClick={() => setSlugLocked((l) => !l)}
                  className="text-gray-400 hover:text-[#3A4A1F] gap-1"
                >
                  {slugLocked ? <><RefreshCw className="w-2.5 h-2.5" />Auto</> : <><EyeOff className="w-2.5 h-2.5" />Kunci</>}
                </Button>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 select-none">/blog/</span>
              <input
                id={`${id}-slug`}
                value={form.slug}
                onChange={(e) => { setSlugLocked(true); handleSlugChange(e.target.value); }}
                placeholder="url-artikel"
                className={`${inputCls(Boolean(errors.slug))} pl-14`}
              />
            </div>
            <FieldErr msg={errors.slug} />
          </div>

          {/* Editor */}
          <div>
            <FieldLabel htmlFor={`${id}-content`} required
              hint="Gunakan toolbar untuk format heading, bold, list, link, dan gambar.">
              Konten
            </FieldLabel>
            <TipTapEditor
              value={form.content}
              onChange={(json) => set("content", json)}
              placeholder="Mulai menulis konten artikel di sini…"
              characterLimit={100_000}
            />
            <FieldErr msg={errors.content} />
          </div>
        </SectionCard>

        {/* SEO */}
        <SectionCard title="SEO & Meta" description="Optimalkan artikel untuk mesin pencari.">
          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel htmlFor={`${id}-excerpt`}
                hint="Ringkasan ditampilkan di halaman listing blog.">
                Ringkasan (Excerpt)
              </FieldLabel>
              <span className={`text-[10px] font-semibold ${excerptLen > 270 ? "text-amber-500" : "text-gray-300"}`}>
                {excerptLen}/300
              </span>
            </div>
            <textarea
              id={`${id}-excerpt`}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Ringkasan singkat yang menarik pembaca…"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none resize-none
                bg-white text-gray-900 placeholder:text-gray-300 leading-relaxed
                focus:ring-2 focus:ring-[#3A4A1F]/20 focus:border-[#3A4A1F]/60 transition-all"
            />
          </div>

          {/* Meta description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel htmlFor={`${id}-metadesc`}
                hint="Deskripsi yang muncul di hasil pencarian Google (maks. 160 karakter).">
                Meta Description
              </FieldLabel>
              <span className={`text-[10px] font-semibold ${metaLen > 150 ? "text-red-500" : metaLen > 120 ? "text-amber-500" : "text-gray-300"}`}>
                {metaLen}/160
              </span>
            </div>
            <textarea
              id={`${id}-metadesc`}
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              rows={2}
              maxLength={160}
              placeholder="Deskripsi untuk hasil pencarian Google…"
              className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 outline-none resize-none
                bg-white text-gray-900 placeholder:text-gray-300 leading-relaxed
                focus:ring-2 focus:ring-[#3A4A1F]/20 focus:border-[#3A4A1F]/60 transition-all"
            />

            {/* SERP preview */}
            {(form.title || form.meta_description) && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-0.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Preview Google</span>
                </div>
                <p className="text-sm text-blue-600 font-medium truncate">{form.title || "Judul Artikel"}</p>
                <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  lodjisvarga.com/blog/{form.slug || "url-artikel"}
                </p>
                <p className="text-xs text-gray-500 line-clamp-2 leading-snug">
                  {form.meta_description || "Meta description belum diisi."}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

      </div>

      {/* ── Right: Sidebar ── */}
      <div className="space-y-4">

        {/* Publish actions */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Publikasi</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
              isPublished ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500"
            }`}>
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <div className="p-4 space-y-2">
            <Button
              variant="outline"
              size="lg"
              type="button"
              onClick={() => handleSave(false)}
              disabled={isBlocked}
              className="w-full gap-2"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Simpan Draft
            </Button>
            <Button
              size="lg"
              type="button"
              onClick={() => handleSave(true)}
              disabled={isBlocked || slugStatus === "taken"}
              className="w-full gap-2 bg-[#3A4A1F] hover:bg-[#2A3A10] text-white"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              {isUploading ? "Upload selesai dulu…" : isEdit ? "Simpan & Terbitkan" : "Terbitkan"}
            </Button>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-700">Thumbnail</span>
            <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, WebP · Maks 2 MB</p>
          </div>
          <div className="p-4">
            <ThumbnailUploader
              value={form.thumbnail_url}
              onChange={(url) => set("thumbnail_url", url)}
              onUploadingChange={setIsUploading}
            />
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-700">Pengaturan</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Category */}
            <div>
              <FieldLabel htmlFor={`${id}-category`}>Kategori</FieldLabel>
              <div className="relative">
                <select
                  id={`${id}-category`}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full h-9 px-3 pr-8 rounded-lg text-sm border border-gray-200 bg-white text-gray-900 outline-none appearance-none
                    focus:ring-2 focus:ring-[#3A4A1F]/20 focus:border-[#3A4A1F]/60 transition-all cursor-pointer"
                >
                  <option value="">— Pilih kategori —</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Read time */}
            <div>
              <FieldLabel htmlFor={`${id}-readtime`} hint="Estimasi waktu yang dibutuhkan untuk membaca.">
                Waktu Baca
              </FieldLabel>
              <div className="flex items-center gap-2">
                <input
                  id={`${id}-readtime`}
                  type="number"
                  min={1}
                  max={120}
                  value={form.read_time_minutes}
                  onChange={(e) => set("read_time_minutes", e.target.value)}
                  className={`${inputCls()} w-20 text-center`}
                />
                <span className="text-sm text-gray-400">menit</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

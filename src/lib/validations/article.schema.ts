import { z } from "zod";
import { SLUG_REGEX } from "@/lib/constants/slug";


// ─── TipTap JSON structural check ────────────────────────────────────────────
// Ensures content is a valid TipTap document envelope.
// Full content validation is TipTap's responsibility client-side.
const tiptapDocSchema = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.record(z.string(), z.unknown())).min(1, "Konten tidak boleh kosong"),
  })
  .passthrough(); // allow extra keys (marks, attrs, etc.)

// ─── Core Article Schema ──────────────────────────────────────────────────────
export const articleSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(120, "Judul maksimal 120 karakter"),

  slug: z
    .string()
    .regex(SLUG_REGEX, "Slug hanya boleh huruf kecil, angka, dan tanda hubung")
    .max(100, "Slug maksimal 100 karakter")
    .optional()
    .or(z.literal("")),

  content: tiptapDocSchema.nullable().optional(),

  excerpt: z
    .string()
    .max(300, "Excerpt maksimal 300 karakter")
    .nullable()
    .optional(),

  meta_description: z
    .string()
    .max(160, "Meta description maksimal 160 karakter (SEO)")
    .nullable()
    .optional(),

  thumbnail_url: z
    .string()
    .url("URL thumbnail tidak valid — harus diawali https://")
    .nullable()
    .optional()
    .or(z.literal("")),

  category: z
    .string()
    .max(50, "Kategori maksimal 50 karakter")
    .nullable()
    .optional(),

  read_time_minutes: z
    .number()
    .int()
    .min(1)
    .max(120)
    .default(3),
});

// Partial version for updates (all fields optional)
export const articleUpdateSchema = articleSchema.partial();

// Inferred types
export type ArticleFormData = z.infer<typeof articleSchema>;
export type ArticleUpdateFormData = z.infer<typeof articleUpdateSchema>;

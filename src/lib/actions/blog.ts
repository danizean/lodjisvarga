"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";
import { SLUG_REGEX } from "@/lib/constants/slug";
import { articleSchema, articleUpdateSchema } from "@/lib/validations/article.schema";
import type { Json, TablesInsert, TablesUpdate } from "@/types/database";
import type { ActionResult } from "@/lib/types/blog";

// Re-export so callers get everything from one import
export type { ActionResult } from "@/lib/types/blog";

// ─── Auth Helper ──────────────────────────────────────────────────────────────
// Mirrors the pattern used in villas.ts / promos.ts — reuses is_admin() RPC.

async function getAuthenticatedAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { supabase, user: null, isAdmin: false };

  const { data: isAdminResult, error: rpcError } = await supabase.rpc("is_admin");
  const isAdmin = !rpcError && isAdminResult === true;

  return { supabase, user, isAdmin };
}

// ─── Path Revalidation Helper ─────────────────────────────────────────────────

function revalidateBlogPaths(slug?: string | null, previousSlug?: string | null) {
  // Public listing
  revalidatePath("/blog");

  // Public detail for current slug
  if (slug) {
    revalidatePath(`/blog/${slug}`);
  }

  // Previous slug if slug was changed
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }

  // Admin list
  revalidatePath("/admin/blog");
  revalidatePath("/admin/dashboard");
}

// ─── Slug Uniqueness Guard ────────────────────────────────────────────────────

async function ensureUniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug;
  let attempt = 0;

  while (true) {
    const query = supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate);

    if (excludeId) query.neq("id", excludeId);

    const { data } = await query.maybeSingle();

    if (!data) return candidate; // slug is free

    // Append numbered suffix: "my-post-2", "my-post-3", ...
    attempt++;
    candidate = `${baseSlug}-${attempt + 1}`;
  }
}

// ─── 1. createArticle ─────────────────────────────────────────────────────────

/**
 * Creates a new article (saved as draft by default).
 * Automatically generates a URL-safe slug from the title if not provided.
 *
 * @example
 *   const result = await createArticle({ title: "Tips Wisata Jogja", content: editor.getJSON() });
 */
export async function createArticle(data: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();

  if (!user) return { success: false, error: "Unauthorized: silakan login terlebih dahulu." };
  if (!isAdmin) return { success: false, error: "Forbidden: hanya admin yang dapat membuat artikel." };

  // ── Validate ──
  const parsed = articleSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi form gagal.",
      details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const fields = parsed.data;

  // ── Generate & de-duplicate slug ──
  const rawSlug = fields.slug?.trim()
    ? slugify(fields.slug)
    : slugify(fields.title);

  const slug = await ensureUniqueSlug(supabase, rawSlug);

  // ── Auto-excerpt: strip from meta_description or leave null ──
  const excerpt = fields.excerpt?.trim() || fields.meta_description?.trim() || null;

  // ── Insert ──
  const payload: TablesInsert<"articles"> = {
    title: fields.title,
    slug,
    content: (fields.content as Json) ?? null,
    excerpt,
    meta_description: fields.meta_description?.trim() || null,
    thumbnail_url: fields.thumbnail_url?.trim() || null,
    category: fields.category?.trim() || null,
    read_time_minutes: fields.read_time_minutes ?? 3,
    is_published: false,
    published_at: null,
    author_id: user.id,
  };

  const { data: article, error } = await supabase
    .from("articles")
    .insert(payload)
    .select("id, slug")
    .single();

  if (error || !article) {
    console.error("[blog:create] Supabase insert error:", error?.message);
    return { success: false, error: `[blog:create] ${error?.message ?? "Gagal menyimpan artikel."}` };
  }

  revalidateBlogPaths(article.slug);

  return { success: true, data: { id: article.id, slug: article.slug } };
}

// ─── 2. updateArticle ─────────────────────────────────────────────────────────

/**
 * Updates an existing article by ID.
 * Only updates supplied fields. `updated_at` is handled by the DB trigger.
 * Handles slug change — revalidates both old and new public paths.
 *
 * @example
 *   const result = await updateArticle("uuid-here", { title: "New Title", content: editor.getJSON() });
 */
export async function updateArticle(
  id: string,
  data: unknown
): Promise<ActionResult<{ slug: string }>> {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();

  if (!user) return { success: false, error: "Unauthorized: silakan login terlebih dahulu." };
  if (!isAdmin) return { success: false, error: "Forbidden: hanya admin yang dapat mengedit artikel." };

  if (!id) return { success: false, error: "[blog:update] ID artikel tidak ditemukan." };

  // ── Validate (partial — all fields optional) ──
  const parsed = articleUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi form gagal.",
      details: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const fields = parsed.data;

  // ── Fetch current slug (for revalidation of old path) ──
  const { data: current } = await supabase
    .from("articles")
    .select("slug, is_published")
    .eq("id", id)
    .single();

  if (!current) return { success: false, error: "[blog:update] Artikel tidak ditemukan." };

  // ── Resolve new slug ──
  let newSlug = current.slug;

  if (fields.slug !== undefined) {
    const rawSlug = fields.slug?.trim()
      ? slugify(fields.slug)
      : fields.title
      ? slugify(fields.title)
      : current.slug;

    newSlug = await ensureUniqueSlug(supabase, rawSlug, id);
  }

  // ── Build update payload ──
  const payload: TablesUpdate<"articles"> = {
    ...(fields.title !== undefined && { title: fields.title }),
    ...(newSlug !== current.slug && { slug: newSlug }),
    ...(fields.content !== undefined && { content: (fields.content as Json) ?? null }),
    ...(fields.excerpt !== undefined && { excerpt: fields.excerpt?.trim() || null }),
    ...(fields.meta_description !== undefined && {
      meta_description: fields.meta_description?.trim() || null,
    }),
    ...(fields.thumbnail_url !== undefined && {
      thumbnail_url: fields.thumbnail_url?.trim() || null,
    }),
    ...(fields.category !== undefined && { category: fields.category?.trim() || null }),
    ...(fields.read_time_minutes !== undefined && {
      read_time_minutes: fields.read_time_minutes,
    }),
  };

  const { error } = await supabase
    .from("articles")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("[blog:update] Supabase update error:", error.message);
    return { success: false, error: `[blog:update] ${error.message}` };
  }

  revalidateBlogPaths(newSlug, current.slug);

  return { success: true, data: { slug: newSlug } };
}

// ─── 3. deleteArticle ─────────────────────────────────────────────────────────

/**
 * Hard-deletes an article by ID.
 * Only callable by admin. Revalidates the blog listing path.
 *
 * @example
 *   const result = await deleteArticle("uuid-here");
 */
export async function deleteArticle(id: string): Promise<ActionResult> {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();

  if (!user) return { success: false, error: "Unauthorized: silakan login terlebih dahulu." };
  if (!isAdmin) return { success: false, error: "Forbidden: hanya admin yang dapat menghapus artikel." };

  if (!id) return { success: false, error: "[blog:delete] ID artikel tidak valid." };

  // Fetch slug before deletion (needed for revalidation)
  const { data: article } = await supabase
    .from("articles")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[blog:delete] Supabase delete error:", error.message);
    return { success: false, error: `[blog:delete] ${error.message}` };
  }

  // Revalidate even for drafts (admin list refresh)
  revalidateBlogPaths(article?.slug ?? null);

  return { success: true };
}

// ─── 4. togglePublish ────────────────────────────────────────────────────────

/**
 * Publishes or unpublishes an article.
 *
 * On publish:   `is_published = true`,  `published_at = NOW()`
 * On unpublish: `is_published = false`, `published_at = null`
 *
 * Hitting this for an already-published article preserves the original
 * `published_at` timestamp so URL date references don't break.
 *
 * @example
 *   await togglePublish("uuid-here", true);   // publish
 *   await togglePublish("uuid-here", false);  // unpublish
 */
export async function togglePublish(
  id: string,
  isPublished: boolean
): Promise<ActionResult<{ slug: string; is_published: boolean }>> {
  const { supabase, user, isAdmin } = await getAuthenticatedAdmin();

  if (!user) return { success: false, error: "Unauthorized: silakan login terlebih dahulu." };
  if (!isAdmin) return { success: false, error: "Forbidden: hanya admin yang dapat mempublikasikan artikel." };

  if (!id) return { success: false, error: "[blog:publish] ID artikel tidak valid." };

  // Fetch current state
  const { data: current } = await supabase
    .from("articles")
    .select("slug, is_published, published_at")
    .eq("id", id)
    .single();

  if (!current) return { success: false, error: "[blog:publish] Artikel tidak ditemukan." };

  // Guard: already in the requested state
  if (current.is_published === isPublished) {
    return {
      success: true,
      data: { slug: current.slug, is_published: isPublished },
    };
  }

  const payload: TablesUpdate<"articles"> = isPublished
    ? {
        is_published: true,
        // Preserve existing published_at if re-publishing (don't overwrite original date)
        published_at: current.published_at ?? new Date().toISOString(),
      }
    : {
        is_published: false,
        published_at: null,
      };

  const { error } = await supabase
    .from("articles")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("[blog:publish] Supabase update error:", error.message);
    return { success: false, error: `[blog:publish] ${error.message}` };
  }

  revalidateBlogPaths(current.slug);

  return { success: true, data: { slug: current.slug, is_published: isPublished } };
}

// ─── 5. checkSlugAvailability ────────────────────────────────────────────────

/**
 * Checks if a slug is available for use.
 * Pass `currentArticleId` to exclude the current article when editing.
 *
 * @example
 *   const { available } = await checkSlugAvailability("my-new-slug", "uuid-here");
 */
export async function checkSlugAvailability(
  slug: string,
  currentArticleId?: string
): Promise<{ available: boolean }> {
  if (!slug || !SLUG_REGEX.test(slug)) return { available: false };

  const supabase = await createClient();
  const query = supabase.from("articles").select("id").eq("slug", slug);
  if (currentArticleId) query.neq("id", currentArticleId);

  const { data } = await query.maybeSingle();
  return { available: !data };
}



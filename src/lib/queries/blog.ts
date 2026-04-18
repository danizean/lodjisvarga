import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

// ─── Shared Types ─────────────────────────────────────────────────────────────

/**
 * Lightweight article shape returned from the `articles_listing` view.
 * Does NOT include the heavy `content` JSONB field — safe for listing pages.
 */
export type ArticleListing = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  category: string | null;
  read_time_minutes: number | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Full article including TipTap JSON content — used only on detail pages.
 */
export type ArticleDetail = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: Json | null;
  thumbnail_url: string | null;
  meta_description: string | null;
  category: string | null;
  read_time_minutes: number | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  author_id: string | null;
};

/**
 * Admin view — all articles regardless of publish state.
 */
export type ArticleAdmin = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  category: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Pagination params for list queries.
 */
export type PaginationParams = {
  page?: number;   // 1-indexed, default 1
  limit?: number;  // rows per page, default 9
};

/**
 * Paginated response wrapper.
 */
export type PaginatedResult<T> = {
  data: T[];
  total: number;        // total matching rows
  page: number;
  limit: number;
  totalPages: number;
};

// ─── 1. getPublishedArticles ──────────────────────────────────────────────────

/**
 * Fetches paginated published articles from the `articles_listing` view.
 *
 * Uses the lightweight view — content JSONB is NOT loaded here.
 * RLS on the underlying table already restricts to `is_published = true`;
 * the view adds an explicit WHERE clause as a second safety layer.
 *
 * @example
 *   const { data, total, totalPages } = await getPublishedArticles({ page: 1, limit: 9 });
 */
export async function getPublishedArticles(
  params: PaginationParams = {}
): Promise<PaginatedResult<ArticleListing>> {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, Math.max(1, params.limit ?? 9)); // cap at 50
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("articles_listing")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        category,
        read_time_minutes,
        published_at,
        created_at,
        updated_at
      `,
      { count: "exact" }
    )
    .order("published_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`[blog] getPublishedArticles failed: ${error.message}`);
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as ArticleListing[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ─── 2. getArticleBySlug ──────────────────────────────────────────────────────

/**
 * Fetches a single published article by its URL slug.
 *
 * Loads the full `content` JSONB for rendering via TipTap/generateHTML.
 * Returns `null` if not found or not published (safe for 404 handling).
 *
 * @example
 *   const article = await getArticleBySlug("tips-wisata-jogja");
 *   if (!article) notFound();
 */
export async function getArticleBySlug(
  slug: string
): Promise<ArticleDetail | null> {
  if (!slug || typeof slug !== "string") return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail_url,
        meta_description,
        category,
        read_time_minutes,
        published_at,
        created_at,
        updated_at,
        author_id
      `
    )
    .eq("slug", slug)
    .eq("is_published", true)   // belt-and-suspenders on top of RLS
    .single();

  if (error) {
    // PGRST116 = no rows found — treat as 404, not a crash
    if (error.code === "PGRST116") return null;
    throw new Error(`[blog] getArticleBySlug("${slug}") failed: ${error.message}`);
  }

  return data as ArticleDetail;
}

// ─── 3. getAdminArticles ──────────────────────────────────────────────────────

/**
 * Fetches all articles (draft + published) for the admin dashboard.
 *
 * Does NOT load `content` JSONB — only metadata needed for the list table.
 * Requires an authenticated admin session; RLS `is_admin()` guards access.
 *
 * @example
 *   const articles = await getAdminArticles();
 */
export async function getAdminArticles(): Promise<ArticleAdmin[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        category,
        is_published,
        published_at,
        created_at,
        updated_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`[blog] getAdminArticles failed: ${error.message}`);
  }

  return (data ?? []) as ArticleAdmin[];
}

// ─── 4. getAdminArticleById ───────────────────────────────────────────────────

/**
 * Fetches a single article by ID for the admin edit form.
 *
 * Loads the full `content` JSONB so the TipTap editor can be pre-populated.
 * Returns `null` if not found.
 *
 * @example
 *   const article = await getAdminArticleById("uuid-here");
 *   if (!article) notFound();
 */
export async function getAdminArticleById(
  id: string
): Promise<(ArticleDetail & { is_published: boolean | null; meta_description: string | null }) | null> {
  if (!id) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        thumbnail_url,
        meta_description,
        category,
        read_time_minutes,
        is_published,
        published_at,
        created_at,
        updated_at,
        author_id
      `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`[blog] getAdminArticleById("${id}") failed: ${error.message}`);
  }

  return data as ArticleDetail & { is_published: boolean | null; meta_description: string | null };
}

// ─── 5. getPublishedSlugs ─────────────────────────────────────────────────────

/**
 * Returns all published slugs for `generateStaticParams` in Next.js ISR.
 *
 * Fetches only the `slug` column — minimal payload for static generation.
 *
 * @example
 *   // app/(public)/blog/[slug]/page.tsx
 *   export async function generateStaticParams() {
 *     const slugs = await getPublishedSlugs();
 *     return slugs.map(({ slug }) => ({ slug }));
 *   }
 */
export async function getPublishedSlugs(): Promise<{ slug: string }[]> {
  // ⚠️  Must use the STATIC client (no cookies/headers) because this function
  //     is called inside generateStaticParams() at build time.
  //     The regular `createClient` (SSR) calls cookies() which is illegal there.
  const { createStaticClient } = await import("@/lib/supabase/static");
  const supabase = createStaticClient();

  const { data, error } = await supabase
    .from("articles_listing")
    .select("slug")
    .order("published_at", { ascending: false });

  if (error) {
    // Non-fatal for static generation — return empty so ISR falls back to on-demand
    console.error("[blog] getPublishedSlugs failed:", error.message);
    return [];
  }

  return (data ?? []) as { slug: string }[];
}

// ─── 6. getRelatedArticles ────────────────────────────────────────────────────

/**
 * Fetches up to `limit` published articles in the same category,
 * excluding the current article. Used for "You might also like" sections.
 *
 * Falls back to latest articles if no category match.
 *
 * @example
 *   const related = await getRelatedArticles({ currentSlug: "my-post", category: "Tips" });
 */
export async function getRelatedArticles(params: {
  currentSlug: string;
  category: string | null;
  limit?: number;
}): Promise<ArticleListing[]> {
  const { currentSlug, category, limit = 3 } = params;
  const supabase = await createClient();

  const query = supabase
    .from("articles_listing")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        thumbnail_url,
        category,
        read_time_minutes,
        published_at,
        created_at,
        updated_at
      `
    )
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  // Prefer same-category articles; if no category, just return latest
  if (category) {
    query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[blog] getRelatedArticles failed:", error.message);
    return [];
  }

  return (data ?? []) as ArticleListing[];
}

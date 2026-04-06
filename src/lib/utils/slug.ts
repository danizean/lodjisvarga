/**
 * Convert a string to a URL-safe slug.
 * Example: slugify("Villa Bukit Mas") → "villa-bukit-mas"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract slug from a full URL path.
 */
export function extractSlug(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

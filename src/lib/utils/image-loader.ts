/**
 * Custom Next.js image loader.
 *
 * Rules:
 * - Supabase Storage public URLs: append `width` + `quality` as query params.
 *   Supabase supports image transformation via these params when the Image
 *   Transformation add-on is enabled. Even without the add-on the URL is valid
 *   (params are silently ignored), which satisfies Next.js's requirement that
 *   the loader MUST use the `width` argument.
 * - Local public assets (starts with "/"): append `?w=<width>` so the width
 *   argument is always encoded in the returned URL.
 * - All other external URLs: append `w` as a query param for compliance.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Local public assets — e.g. /logo-lodji.png
  if (src.startsWith("/") || src.startsWith("data:")) {
    return `${src}?w=${width}`;
  }

  // Supabase Storage public URL
  if (src.includes("supabase.co/storage/v1/object/public")) {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    url.searchParams.set("quality", String(quality ?? 80));
    return url.toString();
  }

  // Unsplash / external CDNs
  try {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return src;
  }
}

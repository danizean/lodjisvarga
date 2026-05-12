import { generateHTML } from "@tiptap/html";
import { getRendererExtensions } from "@/lib/tiptap/extensions";
import type { Json } from "@/types/database";

// ─── HTML generator (server-safe) ────────────────────────────────────────────

export function renderTipTapToHTML(content: Json | null): string {
  if (!content) return "";

  try {
    if (
      typeof content !== "object" ||
      Array.isArray(content) ||
      (content as Record<string, unknown>).type !== "doc"
    ) {
      return "";
    }

    return generateHTML(
      content as Parameters<typeof generateHTML>[0],
      getRendererExtensions()
    );
  } catch (err) {
    console.error("[TipTapRenderer] generateHTML failed:", err);
    return "";
  }
}

// ─── React component (pure Server Component) ─────────────────────────────────

interface TipTapRendererProps {
  content: Json | null;
  /**
   * Additional CSS class applied to the wrapper.
   * Pass "article-prose" on the public article detail page to activate the
   * full brand typography defined in globals.css.
   */
  className?: string;
}

export function TipTapRenderer({ content, className = "" }: TipTapRendererProps) {
  const html = renderTipTapToHTML(content);

  if (!html) {
    return (
      <p className="text-gray-400 italic text-sm py-12 text-center">
        Konten artikel belum tersedia.
      </p>
    );
  }

  return (
    <div
      className={[
        /*
         * prose + prose-neutral: typography reset baseline (requires
         * @tailwindcss/typography, now installed).
         * max-w-none: let parent container control width.
         *
         * All brand-specific overrides live in .article-prose (globals.css)
         * so they work with dangerouslySetInnerHTML without JIT scanning issues.
         */
        "prose prose-neutral max-w-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

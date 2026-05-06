import { generateHTML } from "@tiptap/html";

import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";

import type { Json } from "@/types/database";

// ─── Extension set (mirrors TipTapEditor.tsx exactly) ────────────────────────
//
// HTMLAttributes on Image: we keep only semantic attrs (no Tailwind classes)
// because generated HTML strings are NOT scanned by Tailwind JIT.
// All visual styling is handled by .article-prose img in globals.css.
//
const RENDERER_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    codeBlock: { languageClassPrefix: "language-" },
  }),
  Underline,
  Link.configure({
    HTMLAttributes: {
      rel: "noopener noreferrer",
      target: "_blank",
    },
  }),
  Image.configure({
    inline: false,
    allowBase64: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
  Highlight.configure({ multicolor: false }),
  Typography,
];

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
      RENDERER_EXTENSIONS
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

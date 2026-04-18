import { generateHTML } from "@tiptap/html";

// Import the same extensions used by TipTapEditor so
// the generated HTML matches the editor's output exactly.
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";

import type { Json } from "@/types/database";

// ─── Extension set (must mirror TipTapEditor.tsx) ────────────────────────────
const RENDERER_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    codeBlock: { languageClassPrefix: "language-" },
  }),
  Underline,
  Link.configure({
    HTMLAttributes: {
      class: "text-[#3A4A1F] underline underline-offset-2 decoration-[#3A4A1F]/40 hover:text-[#D4AF37] transition-colors",
      rel: "noopener noreferrer",
      target: "_blank",
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "rounded-xl max-w-full my-8 mx-auto shadow-sm",
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Highlight.configure({ multicolor: false }),
  Typography,
];

// ─── Generate HTML from TipTap JSON (SERVER-SAFE) ────────────────────────────

/**
 * Converts a TipTap JSON document into sanitised HTML.
 * Called exclusively on the server — no client bundle weight.
 *
 * Returns an empty string on null/invalid input rather than crashing.
 */
export function renderTipTapToHTML(content: Json | null): string {
  if (!content) return "";

  try {
    // Validate the basic TipTap doc envelope
    if (
      typeof content !== "object" ||
      Array.isArray(content) ||
      (content as Record<string, unknown>).type !== "doc"
    ) {
      return "";
    }

    return generateHTML(content as Parameters<typeof generateHTML>[0], RENDERER_EXTENSIONS);
  } catch (err) {
    console.error("[TipTapRenderer] generateHTML failed:", err);
    return "";
  }
}

// ─── React component (SSR-rendered, no client JS) ────────────────────────────

interface TipTapRendererProps {
  content: Json | null;
  className?: string;
}

/**
 * Renders TipTap JSON as HTML inside a `prose`-styled container.
 *
 * This is a pure Server Component — no "use client" directive.
 * `dangerouslySetInnerHTML` is safe here because:
 *   1. Content is admin-authored (not user input)
 *   2. TipTap `generateHTML` already escapes user-supplied text nodes
 */
export function TipTapRenderer({ content, className = "" }: TipTapRendererProps) {
  const html = renderTipTapToHTML(content);

  if (!html) {
    return (
      <p className="text-gray-400 italic text-sm py-8 text-center">
        Konten artikel belum tersedia.
      </p>
    );
  }

  return (
    <div
      className={[
        // Base typography
        "prose prose-sm sm:prose-base lg:prose-lg max-w-none",
        // Headings
        "prose-headings:font-serif prose-headings:text-[#3A4A1F] prose-headings:leading-snug",
        "prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100",
        "prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3",
        // Paragraphs
        "prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:my-4",
        // Links
        "prose-a:text-[#3A4A1F] prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-[#3A4A1F]/30 hover:prose-a:border-[#D4AF37] hover:prose-a:text-[#D4AF37]",
        // Lists
        "prose-ul:my-4 prose-ol:my-4 prose-li:my-1.5 prose-li:text-gray-700",
        "prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6",
        // Blockquote — gold left border
        "prose-blockquote:border-l-4 prose-blockquote:border-[#D4AF37] prose-blockquote:bg-amber-50/60 prose-blockquote:rounded-r-xl prose-blockquote:pl-5 prose-blockquote:pr-4 prose-blockquote:py-3 prose-blockquote:my-6",
        "prose-blockquote:text-gray-600 prose-blockquote:not-italic prose-blockquote:font-normal",
        // Inline code
        "prose-code:bg-gray-100 prose-code:text-[#3A4A1F] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
        // Code block
        "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-5 prose-pre:overflow-x-auto prose-pre:text-sm",
        // Images
        "prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto prose-img:my-8",
        // Strong / em
        "prose-strong:text-gray-900 prose-strong:font-bold",
        "prose-em:text-gray-600",
        // HR
        "prose-hr:border-gray-200 prose-hr:my-8",
        className,
      ].join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

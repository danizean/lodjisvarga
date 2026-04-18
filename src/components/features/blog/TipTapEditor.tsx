"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Content } from "@tiptap/core";
import { useEffect, useRef } from "react";

// StarterKit covers: Bold, Italic, Strike, Code, Heading, BulletList,
// OrderedList, Blockquote, CodeBlock, HardBreak, HorizontalRule, History
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";

import { TipTapToolbar } from "./TipTapToolbar";
import type { Json } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

/** TipTap document JSON shape */
export type TipTapJSON = {
  type: "doc";
  content: unknown[];
};

const EMPTY_DOC: TipTapJSON = { type: "doc", content: [] };

interface TipTapEditorProps {
  /** Initial content (TipTap JSON from DB). If null/undefined, starts empty. */
  value?: Json | TipTapJSON | null;
  /** Fired on every editor change. Receives TipTap JSON. */
  onChange?: (json: TipTapJSON) => void;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Make editor read-only */
  readOnly?: boolean;
  /** Additional class names on the outer wrapper */
  className?: string;
  /** Character limit (default: none) */
  characterLimit?: number;
}

// ─── Extension Config ─────────────────────────────────────────────────────────

function buildExtensions(placeholder: string, characterLimit?: number) {
  return [
    StarterKit.configure({
      // Disable nodes we're extending separately
      heading: { levels: [2, 3, 4] },
      codeBlock: { languageClassPrefix: "language-" },
    }),
    Underline,
    Link.configure({
      openOnClick: false,            // don't navigate in editor
      HTMLAttributes: {
        class: "text-[#3A4A1F] underline underline-offset-2 hover:text-[#D4AF37] transition-colors",
        rel: "noopener noreferrer",
        target: "_blank",
      },
      autolink: true,
    }),
    Image.configure({
      inline: false,
      allowBase64: false,            // URL-only; base64 would bloat DB
      HTMLAttributes: {
        class: "rounded-xl max-w-full my-6 mx-auto shadow-sm",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: "is-editor-empty",
    }),
    CharacterCount.configure({
      limit: characterLimit,
    }),
    Highlight.configure({
      multicolor: false,
    }),
    Typography,                      // smart quotes, dashes, etc.
  ];
}

// ─── Parse initial content safely ────────────────────────────────────────────

function parseInitialContent(value?: Json | TipTapJSON | null): Content {
  if (!value) return "";
  try {
    // If it's already an object with type "doc", use it directly
    if (typeof value === "object" && !Array.isArray(value) && (value as TipTapJSON).type === "doc") {
      return value as unknown as Content;
    }
    // If it's a JSON string (shouldn't happen with jsonb, but defensive)
    if (typeof value === "string") {
      const parsed = JSON.parse(value) as TipTapJSON;
      if (parsed.type === "doc") return parsed as unknown as Content;
    }
  } catch {
    // Fallback: treat as plain text paragraph
    if (typeof value === "string") return value;
  }
  return "";
}

// ─── Editor Component ─────────────────────────────────────────────────────────

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Mulai menulis konten artikel di sini…",
  readOnly = false,
  className = "",
  characterLimit,
}: TipTapEditorProps) {
  const initialContent = parseInitialContent(value);

  // Track whether the editor has been externally reset
  const lastValueRef = useRef<typeof value>(value);

  const editor = useEditor({
    extensions: buildExtensions(placeholder, characterLimit),
    content: initialContent || undefined,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: [
          "prose prose-sm sm:prose max-w-none",
          "focus:outline-none",
          "min-h-[320px] px-6 py-5",
          "text-gray-800 leading-relaxed",
          // Heading styles matching brand
          "prose-headings:font-serif prose-headings:text-[#3A4A1F]",
          "prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-3",
          "prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2",
          // Link styles
          "prose-a:text-[#3A4A1F] prose-a:no-underline prose-a:border-b prose-a:border-[#3A4A1F]/30",
          // Blockquote
          "prose-blockquote:border-l-4 prose-blockquote:border-[#D4AF37] prose-blockquote:bg-amber-50/50 prose-blockquote:rounded-r-lg prose-blockquote:pl-5 prose-blockquote:py-1 prose-blockquote:my-4 prose-blockquote:text-gray-600 prose-blockquote:not-italic",
          // Code
          "prose-code:bg-gray-100 prose-code:text-[#3A4A1F] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-mono",
          "prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-5",
          // List
          "prose-ul:my-3 prose-ol:my-3 prose-li:my-1",
          // Image
          "prose-img:rounded-xl prose-img:shadow-sm",
        ].join(" "),
      },
    },
    onUpdate({ editor }) {
      if (!onChange) return;
      const json = editor.getJSON() as TipTapJSON;
      onChange(json);
    },
    immediatelyRender: false,        // prevents SSR hydration mismatch
  });

  // Sync external value changes (e.g. form reset or loading from DB)
  useEffect(() => {
    if (!editor || value === lastValueRef.current) return;
    lastValueRef.current = value;

    const parsed = parseInitialContent(value);
    if (!parsed) {
      editor.commands.clearContent();
      return;
    }

    // Only replace content if it's actually different (avoids cursor jump)
    const currentJSON = JSON.stringify(editor.getJSON());
    const incomingJSON = JSON.stringify(typeof parsed === "string" ? parsed : parsed);
    if (currentJSON !== incomingJSON) {
      editor.commands.setContent(parsed, { emitUpdate: false }); // don't trigger onChange
    }
  }, [editor, value]);

  // Update editable state
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  // ── Stats ──
  const charCount = editor?.storage.characterCount?.characters() ?? 0;
  const wordCount = editor?.storage.characterCount?.words() ?? 0;
  const limitReached = characterLimit && charCount >= characterLimit;

  return (
    <div
      className={`
        flex flex-col
        rounded-xl border
        ${limitReached
          ? "border-red-300 ring-2 ring-red-100"
          : "border-gray-200 focus-within:border-[#3A4A1F]/40 focus-within:ring-2 focus-within:ring-[#3A4A1F]/10"
        }
        bg-white overflow-hidden shadow-sm transition-all duration-200
        ${className}
      `}
    >
      {/* ── Toolbar (hidden for read-only) ── */}
      {!readOnly && editor && (
        <TipTapToolbar editor={editor} />
      )}

      {/* ── Editor Content ── */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer: stats + limit warning ── */}
      <div
        className={`
          flex items-center justify-between
          px-4 py-2 border-t
          text-[11px] font-medium
          ${limitReached
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-gray-100 bg-[#FAFAF8] text-gray-400"
          }
        `}
      >
        <span>
          {wordCount} kata
        </span>
        <span>
          {charCount.toLocaleString()}
          {characterLimit && (
            <> / {characterLimit.toLocaleString()} karakter</>
          )}
          {!characterLimit && " karakter"}
        </span>
      </div>
    </div>
  );
}

// ─── Placeholder CSS ──────────────────────────────────────────────────────────
// Inject global styles for TipTap placeholder (can't use Tailwind here)
// Add this to your globals.css instead if you prefer:
//
// .tiptap p.is-editor-empty:first-child::before {
//   color: #adb5bd;
//   content: attr(data-placeholder);
//   float: left;
//   height: 0;
//   pointer-events: none;
// }

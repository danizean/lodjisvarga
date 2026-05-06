"use client";

import { type Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough,
  Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2, Undo2, Redo2,
  Highlighter, RemoveFormatting,
} from "lucide-react";
import { useCallback } from "react";
import { EditorImageUploader } from "./EditorImageUploader";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ToolbarProps {
  editor: Editor;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`
        inline-flex items-center justify-center
        w-8 h-8 rounded-lg text-sm
        transition-all duration-150
        ${active
          ? "bg-[#3A4A1F] text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-[#3A4A1F]"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />;
}

function GroupLabel({ label }: { label: string }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 select-none px-0.5 hidden lg:block">
      {label}
    </span>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────

export function TipTapToolbar({ editor }: ToolbarProps) {
  // ── Link handler ──
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL tautan:", prev ?? "https://");
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url, target: "_blank", rel: "noopener noreferrer" }).run();
  }, [editor]);

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-[#FAFAF8] border-b border-gray-100 rounded-t-xl"
      role="toolbar"
      aria-label="Editor toolbar"
    >

      {/* ── TEXT STYLE ───────────────────────────────────────── */}
      <GroupLabel label="Text" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        disabled={!editor.can().toggleBold()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        disabled={!editor.can().toggleItalic()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        disabled={!editor.can().toggleStrike()}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        title="Highlight"
      >
        <Highlighter className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Divider />

      {/* ── STRUCTURE ───────────────────────────────────────── */}
      <GroupLabel label="Struktur" />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code className="w-3.5 h-3.5" />
      </ToolbarButton>

      {/* ── Horizontal Rule — was missing, StarterKit includes it ── */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule (Divider)"
      >
        <Minus className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Divider />

      {/* ── ALIGNMENT ───────────────────────────────────────── */}
      <GroupLabel label="Align" />

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        title="Justify"
      >
        <AlignJustify className="w-3.5 h-3.5" />
      </ToolbarButton>

      <Divider />

      {/* ── INSERT ──────────────────────────────────────────── */}
      <GroupLabel label="Insert" />

      <ToolbarButton
        onClick={setLink}
        active={editor.isActive("link")}
        title="Tambah Tautan"
      >
        <Link2 className="w-3.5 h-3.5" />
      </ToolbarButton>

      {/*
        Image insertion — replaced window.prompt() with a proper CMS-grade
        uploader that supports file upload + drag-drop + URL fallback.
      */}
      <EditorImageUploader editor={editor} />

      <Divider />

      {/* ── MISC ────────────────────────────────────────────── */}

      <ToolbarButton
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        title="Hapus Format"
      >
        <RemoveFormatting className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </ToolbarButton>

    </div>
  );
}

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";

/**
 * Core extensions shared between Editor and Renderer.
 * This guarantees strict editor/renderer parity and prevents duplicate registration.
 * 
 * NOTE: TipTap v3 StarterKit now includes Link and Underline by default.
 * Adding them manually causes duplicate extension warnings.
 */
export function getSharedExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      codeBlock: { languageClassPrefix: "language-" },
      // Configure Link (now part of StarterKit in v3)
      link: {
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
        autolink: true,
      },
      // Underline is also part of StarterKit, no extra config needed here
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    Highlight.configure({
      multicolor: false,
    }),
    Typography,
  ];
}

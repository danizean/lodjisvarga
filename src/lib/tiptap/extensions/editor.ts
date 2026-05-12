import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

export interface EditorExtensionOptions {
  placeholder?: string;
  characterLimit?: number;
}

/**
 * Editor-specific extensions.
 * Handles UI helpers, placeholder text, character limits, etc.
 */
export function getEditorSpecificExtensions({
  placeholder,
  characterLimit,
}: EditorExtensionOptions = {}) {
  const extensions = [];

  if (placeholder) {
    extensions.push(
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      })
    );
  }

  // Always include CharacterCount to support stats tracking (even if no limit)
  extensions.push(
    CharacterCount.configure({
      limit: characterLimit,
    })
  );

  return extensions;
}

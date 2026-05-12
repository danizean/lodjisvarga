import { getSharedExtensions } from "./shared";
import { getEditorSpecificExtensions, type EditorExtensionOptions } from "./editor";
import { getRendererSpecificExtensions } from "./renderer";

/**
 * Composes the final extension array for the TipTap Editor.
 * Guarantees stable ordering: Shared -> Editor-specific.
 */
export function getEditorExtensions(options: EditorExtensionOptions = {}) {
  return [
    ...getSharedExtensions(),
    ...getEditorSpecificExtensions(options),
  ];
}

/**
 * Composes the final extension array for the TipTap Renderer (HTML generation).
 * Guarantees stable ordering: Shared -> Renderer-specific.
 */
export function getRendererExtensions() {
  return [
    ...getSharedExtensions(),
    ...getRendererSpecificExtensions(),
  ];
}

export type { EditorExtensionOptions };

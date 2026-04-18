/**
 * Shared types for blog server action responses.
 * Kept outside the "use server" file so they can be imported by client components.
 */
export type ActionResult<T = undefined> =
  | { success: true; data?: T; slug?: string }
  | { success: false; error: string; details?: Record<string, string[]> };

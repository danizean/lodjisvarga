/**
 * Slug format: lowercase letters, numbers, and hyphens only.
 * Single source of truth — shared between server actions and client forms.
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

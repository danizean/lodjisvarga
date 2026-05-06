import { createClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Blog Content Image (in-editor) ─────────────────────────────────────────

export const BLOG_CONTENT_IMAGE_CONFIG = {
  bucket: "villa-media",
  folder: "blog-content",
  /** 5 MB — body images can be larger than thumbnails */
  maxSizeBytes: 5 * 1024 * 1024,
  accept: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  acceptString: ".jpg,.jpeg,.png,.webp,.gif",
} as const;

// ─── Blog Thumbnail ───────────────────────────────────────────────────────────

export const BLOG_THUMBNAIL_CONFIG = {
  bucket: "villa-media",
  folder: "blog-thumbnails",
  /** 2 MB */
  maxSizeBytes: 2 * 1024 * 1024,
  accept: ["image/jpeg", "image/png", "image/webp"],
  acceptString: ".jpg,.jpeg,.png,.webp",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadImageResult {
  publicUrl: string;
  path: string;
}

export interface UploadImageError {
  code: "TOO_LARGE" | "BAD_TYPE" | "UPLOAD_FAILED";
  message: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export function validateImageFile(file: File): UploadImageError | null {
  if (!BLOG_THUMBNAIL_CONFIG.accept.includes(file.type as (typeof BLOG_THUMBNAIL_CONFIG.accept)[number])) {
    return {
      code: "BAD_TYPE",
      message: `Format tidak didukung. Gunakan JPG, PNG, atau WebP.`,
    };
  }

  if (file.size > BLOG_THUMBNAIL_CONFIG.maxSizeBytes) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      code: "TOO_LARGE",
      message: `Ukuran file terlalu besar (${mb} MB). Maksimal 2 MB.`,
    };
  }

  return null;
}

// ─── Core Upload Function (browser-only) ─────────────────────────────────────

/**
 * Uploads a single image file to Supabase Storage under the blog-thumbnails folder.
 * Returns the public URL on success, throws on failure.
 *
 * Must be called from a browser context (uses the browser Supabase client).
 *
 * @example
 *   const url = await uploadBlogThumbnail(file, user.id);
 *   // → "https://xxx.supabase.co/storage/v1/object/public/villa-media/blog-thumbnails/..."
 */
export async function uploadBlogThumbnail(
  file: File,
  userId: string
): Promise<UploadImageResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  const safeName = file.name
    .replace(/\.[^.]+$/, "")               // strip extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")           // slugify
    .replace(/^-+|-+$/g, "")              // trim dashes
    .substring(0, 40);                     // cap at 40 chars

  const filename = `${timestamp}-${random}-${safeName}.${ext}`;
  const path = `${BLOG_THUMBNAIL_CONFIG.folder}/${userId}/${filename}`;

  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BLOG_THUMBNAIL_CONFIG.bucket)
    .upload(path, file, {
      upsert: false,
      cacheControl: "31536000", // 1 year — images are immutable (new path on each upload)
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(BLOG_THUMBNAIL_CONFIG.bucket)
    .getPublicUrl(path);

  return { publicUrl: data.publicUrl, path };
}

// ─── Core Upload Function: Content Images ────────────────────────────────────

/**
 * Uploads a single image file to Supabase Storage under the blog-content folder.
 * Intended for in-editor image insertion (not thumbnails).
 * Returns the public URL on success, throws on failure.
 *
 * Must be called from a browser context (uses the browser Supabase client).
 *
 * @example
 *   const { publicUrl } = await uploadBlogContentImage(file, user.id);
 *   editor.chain().focus().setImage({ src: publicUrl }).run();
 */
export async function uploadBlogContentImage(
  file: File,
  userId: string
): Promise<UploadImageResult> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40);

  const filename = `${timestamp}-${random}-${safeName}.${ext}`;
  const path = `${BLOG_CONTENT_IMAGE_CONFIG.folder}/${userId}/${filename}`;

  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BLOG_CONTENT_IMAGE_CONFIG.bucket)
    .upload(path, file, {
      upsert: false,
      cacheControl: "31536000",
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload gagal: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(BLOG_CONTENT_IMAGE_CONFIG.bucket)
    .getPublicUrl(path);

  return { publicUrl: data.publicUrl, path };
}

// ─── Validation: Content Images ───────────────────────────────────────────────

export function validateContentImageFile(file: File): UploadImageError | null {
  if (!BLOG_CONTENT_IMAGE_CONFIG.accept.includes(file.type as (typeof BLOG_CONTENT_IMAGE_CONFIG.accept)[number])) {
    return {
      code: "BAD_TYPE",
      message: `Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.`,
    };
  }

  if (file.size > BLOG_CONTENT_IMAGE_CONFIG.maxSizeBytes) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      code: "TOO_LARGE",
      message: `Ukuran file terlalu besar (${mb} MB). Maksimal 5 MB.`,
    };
  }

  return null;
}

/**
 * Deletes a previously uploaded thumbnail by its storage path.
 * Non-throwing — logs errors silently (deletion failure is non-critical).
 */
export async function deleteBlogThumbnail(path: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.storage.from(BLOG_THUMBNAIL_CONFIG.bucket).remove([path]);
  } catch (err) {
    console.warn("[deleteBlogThumbnail] Failed to delete:", path, err);
  }
}

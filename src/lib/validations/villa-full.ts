import { z } from "zod";

// ─── Regex Helpers ────────────────────────────────────────────────────────────
const whatsappRegex = /^(\+628|628|08)[0-9]{7,13}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ─── Gallery Item ─────────────────────────────────────────────────────────────
export const galleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  image_url: z.string().url("URL gambar tidak valid").min(1, "URL gambar wajib ada"),
  is_primary: z.boolean().default(false),
  display_order: z.number().int().default(0),
});

// ─── Room Type ────────────────────────────────────────────────────────────────
export const roomTypeFullSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama kamar minimal 3 karakter"),
  base_price: z.coerce.number().min(0, "Harga minimal Rp 0"),
  capacity_adult: z.coerce.number().int().min(1, "Minimal 1 tamu dewasa"),
  capacity_child: z.coerce.number().int().min(0).default(0),
  description: z.string().optional().nullable(),
  amenity_ids: z.array(z.string().uuid()).default([]),
  gallery: z.array(galleryItemSchema).default([]),
});

// ─── Villa (main form) ────────────────────────────────────────────────────────
export const villaFullSchema = z.object({
  villa: z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(3, "Nama properti minimal 3 karakter"),
    slug: z.string().regex(slugRegex, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
    description: z.string().optional().nullable(),
    address: z.string().min(10, "Alamat minimal 10 karakter"),
    gmaps_url: z
      .string()
      .url("URL Google Maps tidak valid")
      .optional()
      .or(z.literal(""))
      .nullable(),
    whatsapp_number: z.string().regex(whatsappRegex, "Format WhatsApp tidak valid (contoh: 628123456789)"),
    default_whatsapp_message: z.string().optional().nullable(),
    status: z.enum(["active", "coming_soon", "inactive"]),
  }),
  amenity_ids: z.array(z.string().uuid()).default([]),
  gallery: z.array(galleryItemSchema).default([]),
  room_types: z.array(roomTypeFullSchema).min(1, "Minimal 1 tipe kamar harus ditambahkan"),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type VillaFullFormData = z.infer<typeof villaFullSchema>;
export type RoomTypeFullFormData = z.infer<typeof roomTypeFullSchema>;
export type GalleryItemFormData = z.infer<typeof galleryItemSchema>;

import { z } from "zod";

// Helper regex sesuai standar Indonesia & SEO Slug
const whatsappRegex = /^(\+628|628|08)[0-9]{7,13}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Schema untuk item gallery (digunakan di Villa dan Room)
export const galleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  image_url: z.string().min(1, "URL Gambar wajib ada"),
  is_primary: z.boolean().default(false),
  display_order: z.number().int().default(0),
});

// Schema untuk Room Type (Unit Inventory)
export const roomTypeFullSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama kamar wajib diisi"),
  base_price: z.coerce.number().min(1000, "Harga minimal Rp1.000"),
  capacity_adult: z.coerce.number().min(1, "Minimal 1 dewasa"),
  capacity_child: z.coerce.number().min(0).default(0),
  description: z.string().optional().nullable(),
  amenity_ids: z.array(z.string().uuid()).default([]),
  gallery: z.array(galleryItemSchema).default([]),
});

// SCHEMA UTAMA: Disesuaikan dengan struktur payload dari Client
export const villaFullSchema = z.object({
  // Kita bungkus dalam objek 'villa' agar sinkron dengan formData.villa di Client
  villa: z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(3, "Nama properti minimal 3 karakter"),
    slug: z.string().regex(slugRegex, "Slug format tidak valid"),
    description: z.string().optional().nullable(),
    address: z.string().min(10, "Alamat wajib diisi minimal 10 karakter"),
    gmaps_url: z.string().url("URL Google Maps tidak valid").optional().or(z.literal("")),
    whatsapp_number: z.string().regex(whatsappRegex, "Format WhatsApp tidak valid (Gunakan 628...)"),
    status: z.enum(["active", "coming_soon", "inactive"]),
  }),
  // Relasi di level yang sama dengan objek villa (sesuai payload handlePublish)
  amenity_ids: z.array(z.string().uuid()).default([]), 
  gallery: z.array(galleryItemSchema).default([]),
  room_types: z.array(roomTypeFullSchema).min(1, "Minimal wajib ada 1 tipe kamar"),
});

// Types untuk keperluan TypeScript
export type VillaFullFormData = z.infer<typeof villaFullSchema>;
export type RoomTypeFullFormData = z.infer<typeof roomTypeFullSchema>;
export type GalleryItemFormData = z.infer<typeof galleryItemSchema>;
import { z } from "zod";

const whatsappRegex = /^(\+628|628|08)[0-9]{7,13}$/;
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const villaDetailsSchema = z.object({
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
});

export type VillaDetailsFormData = z.infer<typeof villaDetailsSchema>;

export const galleryItemSchema = z.object({
  id: z.string().uuid().optional(),
  image_url: z.string().url("URL gambar tidak valid").min(1, "URL gambar wajib ada"),
  is_primary: z.boolean().default(false),
  display_order: z.number().int().default(0),
});

export type GalleryItemFormData = z.infer<typeof galleryItemSchema>;

export const roomTypeSchema = z.object({
  id: z.string().uuid().optional(),
  villa_id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama kamar minimal 3 karakter"),
  bed_type: z.string().min(1, "Tipe kasur wajib diisi").or(z.literal("")).optional().nullable(),
  base_price: z.coerce.number().min(0, "Harga minimal Rp 0"),
  capacity_adult: z.coerce.number().int().optional().nullable(),
  capacity_child: z.coerce.number().int().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  /** Ordered list of amenity IDs to display as highlight chips on the public card. Max 4. */
  highlight_amenity_ids: z.array(z.string().uuid()).max(4, "Maksimal 4 highlight").default([]),
});

export type RoomTypeFormData = z.infer<typeof roomTypeSchema>;

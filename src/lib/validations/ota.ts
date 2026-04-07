import { z } from "zod";

export const otaVillaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama properti minimal 3 karakter"),
  address: z.string().min(5, "Alamat wajib diisi"),
  location_map: z.string().url("Format URL Maps tidak valid").optional().or(z.literal("")),
  whatsapp_contact: z.string()
    .min(9, "Nomor WA terlalu pendek")
    .regex(/^(08|\+628)\d{7,13}$/, "Gunakan format WA Indonesia yang valid (contoh: 0812... atau +628...)"),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const otaRoomTypeSchema = z.object({
  id: z.string().optional(),
  villa_id: z.string().uuid("Invalid Villa ID"),
  name: z.string().min(3, "Nama tipe kamar wajib diisi (misal: Deluxe Room)"),
  base_price: z.coerce.number().int().min(10000, "Harga dasar minimal Rp10.000"),
  capacity: z.coerce.number().int().min(1, "Kapasitas tamu minimal 1 orang").max(50, "Kapasitas berlebih"),
  total_rooms: z.coerce.number().int().min(1, "Stok setidaknya ada 1 tipe kamar ini"),
  description: z.string().optional(),
  facilities: z.array(z.string()).default([]),
});

// Digunakan ketika user mensubmit Villa beserta inisialisasi tipe kamar pertamanya
export const otaCreateVillaWithRoomSchema = z.object({
  villa: otaVillaSchema,
  room_types: z.array(otaRoomTypeSchema.omit({ villa_id: true })).min(1, "Minimal 1 tipe kamar harus ditambahkan"),
});

export type OTAVillaFormData = z.infer<typeof otaVillaSchema>;
export type OTARoomTypeFormData = z.infer<typeof otaRoomTypeSchema>;
export type OTACreateVillaWithRoomFormData = z.infer<typeof otaCreateVillaWithRoomSchema>;

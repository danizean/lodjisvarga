import { z } from "zod";

export const rawVillaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama properti minimal 3 karakter"),
  address: z.string().min(5, "Alamat wajib diisi"),
  gmaps_url: z.string().url("Format URL Maps tidak valid").optional().or(z.literal("")),
  whatsapp_number: z.string()
    .min(9, "Nomor WA terlalu pendek")
    .regex(/^(08|\+628)\d{7,13}$/, "Gunakan format WA Indonesia yang valid (contoh: 0812... atau +628...)")
    .optional().or(z.literal("")),
  status: z.enum(["Published", "Maintenance", "Draft"]).default("Draft"),
});

export const rawRoomTypeSchema = z.object({
  id: z.string().optional(),
  villa_id: z.string().uuid("Invalid Villa ID").optional(),
  name: z.string().min(3, "Nama tipe kamar wajib diisi (misal: Deluxe Room)"),
  base_price: z.coerce.number().int().min(10000, "Harga dasar minimal Rp10.000"),
  capacity_adult: z.coerce.number().int().min(1, "Kapasitas tamu minimal 1 orang").max(50, "Kapasitas berlebih"),
});

export const createVillaWithRoomSchema = z.object({
  villa: rawVillaSchema,
  room_types: z.array(rawRoomTypeSchema.omit({ villa_id: true })).min(1, "Minimal 1 tipe kamar harus ditambahkan"),
});

export type RawVillaFormData = z.infer<typeof rawVillaSchema>;
export type RawRoomTypeFormData = z.infer<typeof rawRoomTypeSchema>;
export type CreateVillaWithRoomFormData = z.infer<typeof createVillaWithRoomSchema>;

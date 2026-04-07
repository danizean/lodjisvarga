import { z } from "zod";

export const bookingSchema = z.object({
  fullName: z.string().min(2, "Nama harus minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  whatsapp: z.string().min(10, "Nomor WhatsApp tidak valid"),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guests: z.number().int().min(1).max(20).default(1),
  specialRequests: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Tanggal check-out harus setelah check-in",
  path: ["checkOut"],
});

export type BookingFormData = z.infer<typeof bookingSchema>;

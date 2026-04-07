import { z } from "zod";

export const bookingSchema = z.object({
  roomTypeId: z.string().uuid("Room type ID tidak valid"),
  customerName: z.string().min(2, "Nama harus minimal 2 karakter"),
  customerPhone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guestCountAdult: z.number().int().min(1).max(20).default(1),
  guestCountChild: z.number().int().min(0).max(20).default(0),
  specialRequests: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Tanggal check-out harus setelah check-in",
  path: ["checkOut"],
});

export type BookingFormData = z.infer<typeof bookingSchema>;

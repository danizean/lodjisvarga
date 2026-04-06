import { z } from "zod";

export const bookingSchema = z.object({
  roomTypeId: z.string().uuid("Invalid room type ID"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Phone must be at least 10 digits"),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guestCountAdult: z.number().int().min(1).max(20).default(1),
  guestCountChild: z.number().int().min(0).max(20).default(0),
  specialRequests: z.string().optional(),
}).refine((data) => data.checkOut > data.checkIn, {
  message: "Check-out must be after check-in",
  path: ["checkOut"],
});

export type BookingFormData = z.infer<typeof bookingSchema>;

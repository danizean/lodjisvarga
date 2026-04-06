"use server";

import { createClient } from "@/lib/supabase/server";
import { bookingSchema, BookingFormData } from "@/lib/validations/booking.schema";
import { saveLead } from "./leads";

export async function createBooking(formData: BookingFormData) {
  const validated = bookingSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }

  const supabase = await createClient();
  
  // Get room type to calculate price
  const { data: roomType } = await supabase
    .from("room_types")
    .select("base_price, villa_id")
    .eq("id", validated.data.roomTypeId)
    .single();

  const nights = Math.ceil(
    (validated.data.checkOut.getTime() - validated.data.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const subtotal = (roomType?.base_price ?? 0) * nights;

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      room_type_id: validated.data.roomTypeId,
      customer_name: validated.data.customerName,
      customer_phone: validated.data.customerPhone,
      check_in: validated.data.checkIn.toISOString().split("T")[0],
      check_out: validated.data.checkOut.toISOString().split("T")[0],
      guest_count_adult: validated.data.guestCountAdult,
      guest_count_child: validated.data.guestCountChild,
      subtotal,
      total_price: subtotal,
      total_nights: nights,
      reservation_status: "pending",
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Also save as a lead
  await saveLead({
    villaId: roomType?.villa_id ?? null,
    customerName: validated.data.customerName,
    customerPhone: validated.data.customerPhone,
    checkIn: validated.data.checkIn,
    checkOut: validated.data.checkOut,
    totalPrice: subtotal,
  });

  return { success: true, data };
}

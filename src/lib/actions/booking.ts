"use server";

import { createClient } from "@/lib/supabase/server";
import { bookingSchema, BookingFormData } from "@/lib/validations/booking.schema";
import { saveLead } from "./leads";
import { calculateDailyPrice } from "@/lib/services/pricing";

export async function createBooking(formData: BookingFormData) {
  const validated = bookingSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }

  const supabase = await createClient();

  // Get room type villa_id for lead tracking
  const { data: roomType } = await supabase
    .from("room_types")
    .select("villa_id")
    .eq("id", validated.data.roomTypeId)
    .single();

  // Dynamic per-day price calculation
  const pricing = await calculateDailyPrice({
    roomTypeId: validated.data.roomTypeId,
    checkIn: validated.data.checkIn,
    checkOut: validated.data.checkOut,
  });

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
      subtotal: pricing.totalPrice,
      total_price: pricing.totalPrice,
      total_nights: pricing.nights,
      reservation_status: "pending",
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  // Save as a lead
  await saveLead({
    villaId: roomType?.villa_id ?? null,
    customerName: validated.data.customerName,
    customerPhone: validated.data.customerPhone,
    checkIn: validated.data.checkIn,
    checkOut: validated.data.checkOut,
    totalPrice: pricing.totalPrice,
  });

  return { success: true, data, pricing };
}

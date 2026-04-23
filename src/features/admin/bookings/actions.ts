"use server";

import { createClient } from "@/lib/supabase/server";
import { saveLead } from "@/lib/actions/leads";
import { bookingSchema, type BookingFormData } from "@/lib/validations/booking.schema";
import { isDateRangeAvailable } from "@/lib/queries/availability";
import { calculateDailyPrice } from "@/lib/services/pricing";

type BookingPricingResult = {
  reservation_id: string;
  base_price: number;
  total_nights: number;
  subtotal: number;
  total_price: number;
  daily_breakdown: Array<{
    date: string;
    price: number;
    source: "base" | "override";
  }>;
};

function getBookingErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan saat membuat booking.";
}

function isMissingRpcError(
  error: { message?: string | null; details?: string | null; code?: string | null },
  functionName: string
) {
  if (error.code === "PGRST202") {
    return true;
  }

  const message = [error.message, error.details].filter(Boolean).join(" ").toLowerCase();
  const normalizedFunctionName = `public.${functionName}`.toLowerCase();

  return (
    message.includes(normalizedFunctionName) &&
    (message.includes("could not find the function") ||
      message.includes("could not choose the best candidate function"))
  );
}

export async function createBooking(formData: BookingFormData) {
  const validated = bookingSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten() };
  }

  try {
    const supabase = await createClient();

    const { data: roomType, error: roomTypeError } = await supabase
      .from("room_types")
      .select("villa_id")
      .eq("id", validated.data.roomTypeId)
      .single();

    if (roomTypeError) {
      throw new Error(roomTypeError.message);
    }

    const { data, error } = await supabase.rpc("create_reservation_with_pricing", {
      p_room_type_id: validated.data.roomTypeId,
      p_customer_name: validated.data.customerName,
      p_customer_phone: validated.data.customerPhone,
      p_check_in: validated.data.checkIn.toISOString().split("T")[0],
      p_check_out: validated.data.checkOut.toISOString().split("T")[0],
      p_guest_count_adult: validated.data.guestCountAdult,
      p_guest_count_child: validated.data.guestCountChild,
    });

    if (error && !isMissingRpcError(error, "create_reservation_with_pricing")) {
      throw new Error(error.message);
    }

    if (error) {
      const isAvailable = await isDateRangeAvailable(
        validated.data.roomTypeId,
        validated.data.checkIn,
        validated.data.checkOut
      );

      if (!isAvailable) {
        return { success: false, error: "Tanggal yang dipilih sudah tidak tersedia." };
      }

      const pricing = await calculateDailyPrice({
        roomTypeId: validated.data.roomTypeId,
        checkIn: validated.data.checkIn,
        checkOut: validated.data.checkOut,
      });

      const insertResult = await supabase
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
        .select("id, room_type_id, check_in, check_out, total_price, total_nights")
        .single();

      if (insertResult.error) {
        throw new Error(insertResult.error.message);
      }

      await saveLead({
        villaId: roomType?.villa_id ?? null,
        customerName: validated.data.customerName,
        customerPhone: validated.data.customerPhone,
        checkIn: validated.data.checkIn,
        checkOut: validated.data.checkOut,
        totalPrice: pricing.totalPrice,
      });

      return {
        success: true,
        data: insertResult.data,
        pricing,
      };
    }

    const pricing = data as BookingPricingResult;

    await saveLead({
      villaId: roomType?.villa_id ?? null,
      customerName: validated.data.customerName,
      customerPhone: validated.data.customerPhone,
      checkIn: validated.data.checkIn,
      checkOut: validated.data.checkOut,
      totalPrice: pricing.total_price,
    });

    return {
      success: true,
      data: {
        id: pricing.reservation_id,
        room_type_id: validated.data.roomTypeId,
        check_in: validated.data.checkIn.toISOString().split("T")[0],
        check_out: validated.data.checkOut.toISOString().split("T")[0],
        total_price: pricing.total_price,
        total_nights: pricing.total_nights,
      },
      pricing: {
        basePrice: pricing.base_price,
        nights: pricing.total_nights,
        totalPrice: pricing.total_price,
        dailyBreakdown: pricing.daily_breakdown,
      },
    };
  } catch (error) {
    return { success: false, error: getBookingErrorMessage(error) };
  }
}

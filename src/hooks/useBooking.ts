"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/features/admin/bookings/actions";
import type { BookingFormData } from "@/lib/validations/booking.schema";

export function useBooking(roomTypeId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submitBooking(data: Omit<BookingFormData, "roomTypeId">) {
    setIsLoading(true);
    setError(null);

    const result = await createBooking({ ...data, roomTypeId });

    if (!result.success) {
      setError(typeof result.error === "string" ? result.error : "Booking failed. Please try again.");
    } else {
      router.push("/booking/success");
    }

    setIsLoading(false);
    return result;
  }

  return { submitBooking, isLoading, error };
}

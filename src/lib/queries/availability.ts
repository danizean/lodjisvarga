import { createClient } from "@/lib/supabase/server";

/**
 * Get blocked dates for a specific room type.
 * blocked_dates is keyed by room_type_id (not villa_id directly).
 */
export async function getBlockedDates(roomTypeId: string): Promise<Date[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("date")
    .eq("room_type_id", roomTypeId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => new Date(row.date));
}

/**
 * Check if a date range is available for a room type (no confirmed/pending reservations overlap).
 */
export async function isDateRangeAvailable(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("id")
    .eq("room_type_id", roomTypeId)
    .lt("check_in", checkOut.toISOString().split("T")[0])
    .gt("check_out", checkIn.toISOString().split("T")[0])
    .in("reservation_status", ["confirmed", "pending"]);

  if (error) throw new Error(error.message);
  return (data ?? []).length === 0;
}

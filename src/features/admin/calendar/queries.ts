import { addDays, eachDayOfInterval, format as formatDate, parseISO } from "date-fns";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AdminCalendarRoom, CalendarDayState } from "./types";

function formatMonthRange(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return { startDate, endDate };
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

export const getAdminCalendarRooms = cache(async (): Promise<AdminCalendarRoom[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("villas")
    .select("id, name, room_types(id, name, base_price, status)")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).flatMap((villa) =>
    (villa.room_types ?? [])
      .filter((room) => room.status !== "inactive")
      .map((room) => ({
        id: room.id,
        name: room.name,
        base_price: room.base_price,
        villaId: villa.id,
        villaName: villa.name,
      }))
  );
});

export async function getRoomCalendarSnapshot(
  roomTypeId: string,
  year: number,
  month: number
): Promise<CalendarDayState[]> {
  const supabase = await createClient();
  const { startDate, endDate } = formatMonthRange(year, month);

  const { data, error } = await (supabase.rpc as any)("admin_get_room_calendar", {
    p_room_type_id: roomTypeId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error && !isMissingRpcError(error, "admin_get_room_calendar")) {
    throw new Error(error.message);
  }

  if (error) {
    const endDateExclusive = formatDate(addDays(parseISO(endDate), 1), "yyyy-MM-dd");
    const [{ data: roomType, error: roomTypeError }, pricesRes, blockedRes, reservationsRes] = await Promise.all([
      supabase
        .from("room_types")
        .select("base_price")
        .eq("id", roomTypeId)
        .single(),
      supabase
        .from("room_prices")
        .select("date, price")
        .eq("room_type_id", roomTypeId)
        .gte("date", startDate)
        .lte("date", endDate),
      supabase
        .from("blocked_dates")
        .select("date, reason")
        .eq("room_type_id", roomTypeId)
        .gte("date", startDate)
        .lte("date", endDate),
      supabase
        .from("reservations")
        .select("id, customer_name, reservation_status, check_in, check_out")
        .eq("room_type_id", roomTypeId)
        .in("reservation_status", ["pending", "confirmed"])
        .lt("check_in", endDateExclusive)
        .gt("check_out", startDate),
    ]);

    if (roomTypeError || pricesRes.error || blockedRes.error || reservationsRes.error) {
      throw new Error(
        roomTypeError?.message ??
          pricesRes.error?.message ??
          blockedRes.error?.message ??
          reservationsRes.error?.message ??
          error.message
      );
    }

    const basePrice = Number(roomType?.base_price ?? 0);
    const priceMap = new Map((pricesRes.data ?? []).map((row) => [row.date, Number(row.price)]));
    const blockedMap = new Map((blockedRes.data ?? []).map((row) => [row.date, row.reason ?? null]));
    const reservationRows = reservationsRes.data ?? [];

    return eachDayOfInterval({
      start: new Date(`${startDate}T00:00:00`),
      end: new Date(`${endDate}T00:00:00`),
    }).map((date) => {
      const dateKey = formatDate(date, "yyyy-MM-dd");
      const matchedReservation =
        reservationRows.find(
          (reservation) => dateKey >= reservation.check_in && dateKey < reservation.check_out
        ) ?? null;
      const overridePrice = priceMap.get(dateKey);

      return {
        date: dateKey,
        effectivePrice: overridePrice ?? basePrice,
        basePrice,
        priceSource: overridePrice !== undefined ? "override" : "base",
        isBlocked: blockedMap.has(dateKey),
        blockReason: blockedMap.get(dateKey) ?? null,
        reservation: matchedReservation
          ? {
              id: matchedReservation.id,
              status: matchedReservation.reservation_status ?? null,
              customerName: matchedReservation.customer_name ?? null,
            }
          : null,
      };
    });
  }

  return (data ?? []).map((day: any) => ({
    date: day.date,
    effectivePrice: Number(day.effective_price ?? 0),
    basePrice: Number(day.base_price ?? 0),
    priceSource: day.price_source === "override" ? "override" : "base",
    isBlocked: Boolean(day.is_blocked),
    blockReason: day.block_reason ?? null,
    reservation: day.reservation_id
      ? {
          id: day.reservation_id,
          status: day.reservation_status ?? null,
          customerName: day.customer_name ?? null,
        }
      : null,
  }));
}

"use server";

import { revalidatePath } from "next/cache";
import { addDays, eachDayOfInterval, format as formatDate, parseISO } from "date-fns";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import { requireAdminUser } from "@/features/admin/shared/auth";
import { getRoomCalendarSnapshot } from "./queries";
import type { ApplyTo } from "./types";

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD");

const calendarMutationSchema = z
  .object({
    room_type_id: z.string().uuid(),
    start_date: dateStringSchema,
    end_date: dateStringSchema,
    apply_to: z.enum(["all", "weekdays", "weekends"]).default("all"),
  })
  .refine((data) => new Date(data.start_date) <= new Date(data.end_date), {
    message: "Tanggal akhir harus sama atau setelah tanggal mulai",
    path: ["end_date"],
  });

const bulkPriceSchema = calendarMutationSchema.extend({
  price: z.coerce.number().int().positive("Harga harus lebih dari nol"),
});

const blockDatesSchema = calendarMutationSchema.extend({
  reason: z.string().trim().min(1).max(120).optional(),
});

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan sistem.";
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

function getTargetDates(startDate: string, endDate: string, applyTo: ApplyTo) {
  return eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) })
    .filter((day) => {
      if (applyTo === "all") return true;
      const dayIndex = day.getDay();
      const isWeekend = dayIndex === 0 || dayIndex === 6;
      return applyTo === "weekends" ? isWeekend : !isWeekend;
    })
    .map((day) => formatDate(day, "yyyy-MM-dd"));
}

async function writeAuditLog(params: {
  action: string;
  tableName: "room_prices" | "blocked_dates";
  roomTypeId: string;
  userId: string;
  values: Json;
}) {
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    action: params.action,
    table_name: params.tableName,
    record_id: params.roomTypeId,
    new_values: params.values,
    user_id: params.userId,
  });
}

async function ensureNoBookedDates(
  roomTypeId: string,
  targetDates: string[]
) {
  if (targetDates.length === 0) {
    return;
  }

  const supabase = await createClient();
  const startDate = targetDates[0];
  const endDate = targetDates[targetDates.length - 1];
  const endDateExclusive = formatDate(addDays(parseISO(endDate), 1), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("reservations")
    .select("check_in, check_out")
    .eq("room_type_id", roomTypeId)
    .in("reservation_status", ["pending", "confirmed"])
    .lt("check_in", endDateExclusive)
    .gt("check_out", startDate);

  if (error) {
    throw new Error(error.message);
  }

  const conflictDate = targetDates.find((date) =>
    (data ?? []).some((reservation) => date >= reservation.check_in && date < reservation.check_out)
  );

  if (conflictDate) {
    throw new Error(`Cannot change price for booked date ${conflictDate}`);
  }
}

async function ensureNoBlockedDates(
  roomTypeId: string,
  targetDates: string[]
) {
  if (targetDates.length === 0) {
    return;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("date")
    .eq("room_type_id", roomTypeId)
    .in("date", targetDates);

  if (error) {
    throw new Error(error.message);
  }

  if ((data ?? []).length > 0) {
    throw new Error(`Date ${(data ?? [])[0].date} is already blocked`);
  }
}

function revalidateAdminCalendar() {
  revalidatePath("/");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/villas");
  revalidatePath("/admin/calendar");
}

export async function bulkUpsertPrices(formData: unknown) {
  try {
    const { supabase, user } = await requireAdminUser();
    const parsed = bulkPriceSchema.safeParse(formData);

    if (!parsed.success) {
      return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };
    }

    const { room_type_id, start_date, end_date, price, apply_to } = parsed.data;
    const { data, error } = await supabase.rpc("admin_set_room_price_range", {
      p_room_type_id: room_type_id,
      p_start_date: start_date,
      p_end_date: end_date,
      p_price: price,
      p_apply_to: apply_to,
    });

    if (error && !isMissingRpcError(error, "admin_set_room_price_range")) {
      throw new Error(error.message);
    }

    if (error) {
      const targetDates = getTargetDates(start_date, end_date, apply_to);
      await ensureNoBookedDates(room_type_id, targetDates);

      if (targetDates.length > 0) {
        const { error: deleteError } = await supabase
          .from("room_prices")
          .delete()
          .eq("room_type_id", room_type_id)
          .in("date", targetDates);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        const { error: insertError } = await supabase.from("room_prices").insert(
          targetDates.map((date) => ({
            room_type_id,
            date,
            price,
          }))
        );

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      await writeAuditLog({
        action: "BULK_PRICE_UPDATE",
        tableName: "room_prices",
        roomTypeId: room_type_id,
        userId: user.id,
        values: { start_date, end_date, price, apply_to, days_updated: targetDates.length },
      });

      revalidateAdminCalendar();
      return { success: true, days_updated: targetDates.length };
    }

    await writeAuditLog({
      action: "BULK_PRICE_UPDATE",
      tableName: "room_prices",
      roomTypeId: room_type_id,
      userId: user.id,
      values: { start_date, end_date, price, apply_to, days_updated: data ?? 0 },
    });

    revalidateAdminCalendar();
    return { success: true, days_updated: Number(data ?? 0) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function blockDates(formData: unknown) {
  try {
    const { supabase, user } = await requireAdminUser();
    const parsed = blockDatesSchema.safeParse(formData);

    if (!parsed.success) {
      return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };
    }

    const { room_type_id, start_date, end_date, reason, apply_to } = parsed.data;
    const { data, error } = await supabase.rpc("admin_block_room_dates", {
      p_room_type_id: room_type_id,
      p_start_date: start_date,
      p_end_date: end_date,
      p_reason: reason ?? "Manual block",
      p_apply_to: apply_to,
    });

    if (error && !isMissingRpcError(error, "admin_block_room_dates")) {
      throw new Error(error.message);
    }

    if (error) {
      const targetDates = getTargetDates(start_date, end_date, apply_to);
      await ensureNoBlockedDates(room_type_id, targetDates);
      await ensureNoBookedDates(room_type_id, targetDates);

      if (targetDates.length > 0) {
        const { error: insertError } = await supabase.from("blocked_dates").insert(
          targetDates.map((date) => ({
            room_type_id,
            date,
            reason: reason ?? "Manual block",
            sync_source: "manual",
          }))
        );

        if (insertError) {
          throw new Error(insertError.message);
        }
      }

      await writeAuditLog({
        action: "BLOCK_DATES",
        tableName: "blocked_dates",
        roomTypeId: room_type_id,
        userId: user.id,
        values: { start_date, end_date, reason, apply_to, days_updated: targetDates.length },
      });

      revalidateAdminCalendar();
      return { success: true, days_updated: targetDates.length };
    }

    await writeAuditLog({
      action: "BLOCK_DATES",
      tableName: "blocked_dates",
      roomTypeId: room_type_id,
      userId: user.id,
      values: { start_date, end_date, reason, apply_to, days_updated: data ?? 0 },
    });

    revalidateAdminCalendar();
    return { success: true, days_updated: Number(data ?? 0) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function unblockDates(
  roomTypeId: string,
  startDate: string,
  endDate: string,
  applyTo: ApplyTo = "all"
) {
  try {
    const { supabase, user } = await requireAdminUser();
    const parsed = calendarMutationSchema.safeParse({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      apply_to: applyTo,
    });

    if (!parsed.success) {
      return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };
    }

    const { room_type_id, start_date, end_date, apply_to } = parsed.data;
    const { data, error } = await supabase.rpc("admin_unblock_room_dates", {
      p_room_type_id: room_type_id,
      p_start_date: start_date,
      p_end_date: end_date,
      p_apply_to: apply_to,
    });

    if (error && !isMissingRpcError(error, "admin_unblock_room_dates")) {
      throw new Error(error.message);
    }

    if (error) {
      const targetDates = getTargetDates(start_date, end_date, apply_to);

      if (targetDates.length > 0) {
        const { error: deleteError } = await supabase
          .from("blocked_dates")
          .delete()
          .eq("room_type_id", room_type_id)
          .in("date", targetDates);

        if (deleteError) {
          throw new Error(deleteError.message);
        }
      }

      await writeAuditLog({
        action: "UNBLOCK_DATES",
        tableName: "blocked_dates",
        roomTypeId: room_type_id,
        userId: user.id,
        values: { start_date, end_date, apply_to, days_updated: targetDates.length },
      });

      revalidateAdminCalendar();
      return { success: true, days_updated: targetDates.length };
    }

    await writeAuditLog({
      action: "UNBLOCK_DATES",
      tableName: "blocked_dates",
      roomTypeId: room_type_id,
      userId: user.id,
      values: { start_date, end_date, apply_to, days_updated: data ?? 0 },
    });

    revalidateAdminCalendar();
    return { success: true, days_updated: Number(data ?? 0) };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function clearPriceOverrides(
  roomTypeId: string,
  startDate: string,
  endDate: string,
  applyTo: ApplyTo = "all"
) {
  try {
    const { supabase, user } = await requireAdminUser();
    const parsed = calendarMutationSchema.safeParse({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      apply_to: applyTo,
    });

    if (!parsed.success) {
      return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };
    }

    const { room_type_id, start_date, end_date, apply_to } = parsed.data;
    const targetDates = getTargetDates(start_date, end_date, apply_to);

    if (targetDates.length > 0) {
      const { error } = await supabase
        .from("room_prices")
        .delete()
        .eq("room_type_id", room_type_id)
        .in("date", targetDates);

      if (error) {
        throw new Error(error.message);
      }
    }

    await writeAuditLog({
      action: "CLEAR_PRICE_OVERRIDES",
      tableName: "room_prices",
      roomTypeId: room_type_id,
      userId: user.id,
      values: { start_date, end_date, apply_to, days_updated: targetDates.length },
    });

    revalidateAdminCalendar();
    return { success: true, days_updated: targetDates.length };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function getPricingCalendarData(roomTypeId: string, year: number, month: number) {
  try {
    const days = await getRoomCalendarSnapshot(roomTypeId, year, month);
    return { days, error: null };
  } catch (error) {
    return { days: [], error: getErrorMessage(error) };
  }
}

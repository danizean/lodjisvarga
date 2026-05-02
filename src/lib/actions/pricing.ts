"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { eachDayOfInterval, format as formatDate } from "date-fns";
import type { Json } from "@/types/database";

// ─── Schema ───────────────────────────────────────────────────────────────────
const bulkPriceSchema = z.object({
  room_type_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  price: z.coerce.number().min(0, "Harga minimal Rp 0"),
  apply_to: z.enum(["all", "weekdays", "weekends"]).default("all"),
}).refine(d => new Date(d.start_date) <= new Date(d.end_date), {
  message: "Tanggal akhir harus sama atau setelah tanggal mulai",
  path: ["end_date"],
});

const blockDatesSchema = z.object({
  room_type_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
  apply_to: z.enum(["all", "weekdays", "weekends"]).default("all"),
}).refine(d => new Date(d.start_date) <= new Date(d.end_date), {
  message: "Tanggal akhir harus sama atau setelah tanggal mulai",
  path: ["end_date"],
});

// ─── Helper ───────────────────────────────────────────────────────────────────
async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: isAdminResult, error: isAdminError } = await supabase.rpc("is_admin");
  if (!isAdminError && isAdminResult === true) {
    return { supabase, user, isAdmin: true };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = profile?.role?.toLowerCase();
  return { supabase, user, isAdmin: role === "admin" || role === "superadmin" };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui";
}

function getTargetDates(startDate: string, endDate: string, applyTo: "all" | "weekdays" | "weekends") {
  return eachDayOfInterval({ start: new Date(startDate), end: new Date(endDate) })
    .filter((day) => {
      if (applyTo === "all") return true;
      const dayIndex = day.getDay();
      const isWeekend = dayIndex === 5 || dayIndex === 6 || dayIndex === 0;
      return applyTo === "weekends" ? isWeekend : !isWeekend;
    })
    .map((day) => formatDate(day, "yyyy-MM-dd"));
}

async function auditPricingChange(params: {
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

// ─── Bulk Upsert Prices ───────────────────────────────────────────────────────
/**
 * Sets a specific price for a room type across a date range.
 * Uses Server-side Supabase DB function set_bulk_price if available,
 * otherwise falls back to delete-then-insert per date.
 */
export async function bulkUpsertPrices(formData: unknown) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const parsed = bulkPriceSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };
  }

  const { room_type_id, start_date, end_date, price, apply_to } = parsed.data;

  try {
    if (apply_to === "all") {
      // Try to use existing DB function if available.
      const { error: fnError } = await supabase.rpc("set_bulk_price", {
        p_room_type_id: room_type_id,
        p_start_date: start_date,
        p_end_date: end_date,
        p_price: price,
      });

      if (!fnError) {
        await auditPricingChange({
          action: "BULK_PRICE_UPDATE",
          tableName: "room_prices",
          roomTypeId: room_type_id,
          userId: user.id,
          values: { start_date, end_date, price, apply_to },
        });

        revalidatePath("/");
        revalidatePath("/admin/villas");
        revalidatePath("/admin/calendar");
        return { success: true };
      }
    }

    const dateStrings = getTargetDates(start_date, end_date, apply_to);
    if (dateStrings.length === 0) return { error: "Tidak ada tanggal yang cocok dengan filter hari." };

    await supabase.from("room_prices").delete()
      .eq("room_type_id", room_type_id)
      .in("date", dateStrings);

    const payload = dateStrings.map(date => ({ room_type_id, date, price }));
    const { error: insertError } = await supabase.from("room_prices").insert(payload);
    if (insertError) throw new Error(insertError.message);

    await supabase.from("audit_logs").insert({
      action: "BULK_PRICE_UPDATE",
      table_name: "room_prices",
      record_id: room_type_id,
      new_values: { start_date, end_date, price, apply_to, days_updated: dateStrings.length },
      user_id: user.id,
    });

    revalidatePath("/");
    revalidatePath("/admin/villas");
    revalidatePath("/admin/calendar");
    return { success: true, days_updated: dateStrings.length };

  } catch (err: unknown) {
    const message = getErrorMessage(err);
    console.error("bulkUpsertPrices Error:", message);
    return { error: message };
  }
}

// ─── Block Dates ──────────────────────────────────────────────────────────────
export async function blockDates(formData: unknown) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const parsed = blockDatesSchema.safeParse(formData);
  if (!parsed.success) return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };

  const { room_type_id, start_date, end_date, reason, apply_to } = parsed.data;

  try {
    if (apply_to === "all") {
      const { error } = await supabase.rpc("block_dates_range", {
        p_room_type_id: room_type_id,
        p_start_date: start_date,
        p_end_date: end_date,
        p_reason: reason ?? "Maintenance",
      });

      if (!error) {
        await supabase.from("audit_logs").insert({
          action: "BLOCK_DATES",
          table_name: "blocked_dates",
          record_id: room_type_id,
          new_values: { start_date, end_date, reason, apply_to },
          user_id: user.id,
        });

        revalidatePath("/");
        revalidatePath("/admin/villas");
        revalidatePath("/admin/calendar");
        return { success: true };
      }
    }

    const dateStrings = getTargetDates(start_date, end_date, apply_to);
    if (dateStrings.length === 0) return { error: "Tidak ada tanggal yang cocok dengan filter hari." };

    await supabase.from("blocked_dates").delete()
      .eq("room_type_id", room_type_id)
      .in("date", dateStrings);

    const { error: insertError } = await supabase.from("blocked_dates").insert(
      dateStrings.map((date) => ({
        room_type_id,
        date,
        reason: reason ?? "Maintenance",
        sync_source: "manual",
      }))
    );
    if (insertError) throw new Error(insertError.message);

    await supabase.from("audit_logs").insert({
      action: "BLOCK_DATES",
      table_name: "blocked_dates",
      record_id: room_type_id,
      new_values: { start_date, end_date, reason, apply_to, days_updated: dateStrings.length },
      user_id: user.id,
    });

    revalidatePath("/");
    revalidatePath("/admin/villas");
    revalidatePath("/admin/calendar");
    return { success: true, days_updated: dateStrings.length };
  } catch (err: unknown) {
    return { error: getErrorMessage(err) };
  }
}

// ─── Unblock Dates ────────────────────────────────────────────────────────────
export async function unblockDates(roomTypeId: string, startDate: string, endDate: string) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const { error } = await supabase.rpc("unblock_dates_range", {
    p_room_type_id: roomTypeId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    const dateStrings = getTargetDates(startDate, endDate, "all");
    const { error: deleteError } = await supabase
      .from("blocked_dates")
      .delete()
      .eq("room_type_id", roomTypeId)
      .in("date", dateStrings);

    if (deleteError) return { error: deleteError.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/villas");
  revalidatePath("/admin/calendar");
  return { success: true };
}

// â”€â”€â”€ Clear Price Overrides â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function clearPriceOverrides(roomTypeId: string, startDate: string, endDate: string) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const parsed = blockDatesSchema.safeParse({
    room_type_id: roomTypeId,
    start_date: startDate,
    end_date: endDate,
    reason: "clear-price",
    apply_to: "all",
  });
  if (!parsed.success) return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };

  const dateStrings = getTargetDates(startDate, endDate, "all");
  const { error } = await supabase
    .from("room_prices")
    .delete()
    .eq("room_type_id", roomTypeId)
    .in("date", dateStrings);

  if (error) return { error: error.message };

  await auditPricingChange({
    action: "CLEAR_PRICE_OVERRIDES",
    tableName: "room_prices",
    roomTypeId,
    userId: user.id,
    values: { startDate, endDate, days_updated: dateStrings.length },
  });

  revalidatePath("/");
  revalidatePath("/admin/villas");
  revalidatePath("/admin/calendar");
  return { success: true, days_updated: dateStrings.length };
}

// ─── Get Prices for Month (for calendar visualization) ────────────────────────
export async function getPricesForRoomType(roomTypeId: string, year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const { data, error } = await supabase
    .from("room_prices")
    .select("date, price")
    .eq("room_type_id", roomTypeId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date");

  if (error) return [];
  return data ?? [];
}

// ─── Get Blocked Dates for Room ───────────────────────────────────────────────
export async function getBlockedDatesForRoom(roomTypeId: string, year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const { data } = await supabase
    .from("blocked_dates")
    .select("date, reason")
    .eq("room_type_id", roomTypeId)
    .gte("date", startDate)
    .lte("date", endDate);

  return data ?? [];
}

export async function getPricingCalendarData(roomTypeId: string, year: number, month: number) {
  const supabase = await createClient();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const [pricesRes, blockedRes] = await Promise.all([
    supabase
      .from("room_prices")
      .select("date, price")
      .eq("room_type_id", roomTypeId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date"),
    supabase
      .from("blocked_dates")
      .select("date, reason")
      .eq("room_type_id", roomTypeId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date"),
  ]);

  return {
    prices: pricesRes.data ?? [],
    blockedDates: blockedRes.data ?? [],
    error: pricesRes.error?.message ?? blockedRes.error?.message ?? null,
  };
}

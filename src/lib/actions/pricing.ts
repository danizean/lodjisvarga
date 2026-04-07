"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { eachDayOfInterval, format as formatDate } from "date-fns";

// ─── Schema ───────────────────────────────────────────────────────────────────
const bulkPriceSchema = z.object({
  room_type_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD"),
  price: z.coerce.number().min(1000, "Harga minimal Rp 1.000"),
}).refine(d => new Date(d.start_date) <= new Date(d.end_date), {
  message: "Tanggal akhir harus sama atau setelah tanggal mulai",
  path: ["end_date"],
});

const blockDatesSchema = z.object({
  room_type_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
}).refine(d => new Date(d.start_date) <= new Date(d.end_date), {
  message: "Tanggal akhir harus sama atau setelah tanggal mulai",
  path: ["end_date"],
});

// ─── Helper ───────────────────────────────────────────────────────────────────
async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, isAdmin: profile?.role === "admin" || profile?.role === "superadmin" };
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

  const { room_type_id, start_date, end_date, price } = parsed.data;

  try {
    // Try to use existing DB function if available
    const { error: fnError } = await supabase.rpc("set_bulk_price", {
      p_room_type_id: room_type_id,
      p_start_date: start_date,
      p_end_date: end_date,
      p_price: price,
    });

    if (!fnError) {
      // Log the audit
      await supabase.from("audit_logs").insert({
        action: "BULK_PRICE_UPDATE",
        table_name: "room_prices",
        record_id: room_type_id,
        new_values: { start_date, end_date, price },
        user_id: user.id,
      });

      revalidatePath("/admin/villas");
      revalidatePath(`/admin/pricing`);
      return { success: true };
    }

    // Fallback: manual upsert per day
    const days = eachDayOfInterval({ start: new Date(start_date), end: new Date(end_date) });
    const dateStrings = days.map(d => formatDate(d, "yyyy-MM-dd"));

    // Delete existing prices for this date range
    await supabase.from("room_prices").delete()
      .eq("room_type_id", room_type_id)
      .in("date", dateStrings);

    // Insert new prices
    const payload = dateStrings.map(date => ({ room_type_id, date, price }));
    const { error: insertError } = await supabase.from("room_prices").insert(payload);
    if (insertError) throw new Error(insertError.message);

    // Audit log
    await supabase.from("audit_logs").insert({
      action: "BULK_PRICE_UPDATE",
      table_name: "room_prices",
      record_id: room_type_id,
      new_values: { start_date, end_date, price, days_updated: days.length },
      user_id: user.id,
    });

    revalidatePath("/admin/villas");
    revalidatePath("/admin/pricing");
    return { success: true, days_updated: days.length };

  } catch (err: any) {
    console.error("bulkUpsertPrices Error:", err.message);
    return { error: err.message };
  }
}

// ─── Block Dates ──────────────────────────────────────────────────────────────
export async function blockDates(formData: unknown) {
  const { supabase, user, isAdmin } = await getAdminClient();
  if (!user || !isAdmin) return { error: "Unauthorized" };

  const parsed = blockDatesSchema.safeParse(formData);
  if (!parsed.success) return { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors };

  const { room_type_id, start_date, end_date, reason } = parsed.data;

  try {
    const { error } = await supabase.rpc("block_dates_range", {
      p_room_type_id: room_type_id,
      p_start_date: start_date,
      p_end_date: end_date,
      p_reason: reason ?? "Maintenance",
    });

    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      action: "BLOCK_DATES",
      table_name: "blocked_dates",
      record_id: room_type_id,
      new_values: { start_date, end_date, reason },
      user_id: user.id,
    });

    revalidatePath("/admin/pricing");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
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

  if (error) return { error: error.message };

  revalidatePath("/admin/pricing");
  return { success: true };
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

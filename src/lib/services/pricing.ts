import { createClient } from "@/lib/supabase/server";

export interface DailyPriceEntry {
  date: string; // "YYYY-MM-DD"
  price: number;
  source: "override" | "base";
}

export interface PriceBreakdown {
  basePrice: number;
  nights: number;
  totalPrice: number;
  dailyBreakdown: DailyPriceEntry[];
}

/**
 * Iterates every night in the stay and looks up room_prices for each date.
 * Falls back to base_price when no override exists.
 */
export async function calculateDailyPrice(params: {
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
}): Promise<PriceBreakdown> {
  const supabase = await createClient();

  const nights = Math.round(
    (params.checkOut.getTime() - params.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Fetch base price
  const { data: roomType } = await supabase
    .from("room_types")
    .select("base_price")
    .eq("id", params.roomTypeId)
    .single();

  const basePrice = Number(roomType?.base_price ?? 0);

  // Fetch all price overrides for the date range in one query
  const checkInStr = params.checkIn.toISOString().split("T")[0];
  const checkOutStr = params.checkOut.toISOString().split("T")[0];

  const { data: priceOverrides } = await supabase
    .from("room_prices")
    .select("date, price")
    .eq("room_type_id", params.roomTypeId)
    .gte("date", checkInStr)
    .lt("date", checkOutStr);

  // Build a lookup map: "YYYY-MM-DD" → overridePrice
  const overrideMap = new Map<string, number>();
  if (priceOverrides) {
    for (const row of priceOverrides) {
      overrideMap.set(row.date, Number(row.price));
    }
  }

  // Iterate each night and accumulate
  const dailyBreakdown: DailyPriceEntry[] = [];
  let totalPrice = 0;

  for (let i = 0; i < nights; i++) {
    const d = new Date(params.checkIn);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    const override = overrideMap.get(dateStr);
    const nightPrice = override !== undefined ? override : basePrice;
    const source: "override" | "base" = override !== undefined ? "override" : "base";

    dailyBreakdown.push({ date: dateStr, price: nightPrice, source });
    totalPrice += nightPrice;
  }

  return { basePrice, nights, totalPrice, dailyBreakdown };
}

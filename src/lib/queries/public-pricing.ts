import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/types/database";

type PromoRow = Tables<"promos">;

type RoomPricingShape = {
  id: string;
  base_price: number | null;
};

export function getJakartaDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getPublicPricingSnapshot(
  supabase: SupabaseClient<Database>,
  roomTypeIds: string[],
  date: string = getJakartaDateKey()
) {
  const [pricesRes, promosRes] = await Promise.all([
    roomTypeIds.length > 0
      ? supabase
          .from("room_prices")
          .select("room_type_id, date, price")
          .in("room_type_id", roomTypeIds)
          .eq("date", date)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("promos")
      .select("id, title, discount_code, discount_value, expired_at, is_active")
      .eq("is_active", true)
      .or(`expired_at.is.null,expired_at.gte.${date}`)
      .order("discount_value", { ascending: false })
      .limit(1),
  ]);

  return {
    date,
    prices: pricesRes.data ?? [],
    pricesError: pricesRes.error,
    activePromo: (promosRes.data?.[0] ?? null) as PromoRow | null,
    promosError: promosRes.error,
    priceMap: new Map((pricesRes.data ?? []).map((row) => [row.room_type_id, Number(row.price)])),
  };
}

export function attachPublicPricing<T extends RoomPricingShape>(
  rooms: T[],
  priceMap: Map<string, number>
) {
  return rooms.map((room) => ({
    ...room,
    effective_price: priceMap.get(room.id) ?? 0,
    price_source: priceMap.has(room.id) ? ("override" as const) : ("base" as const),
  }));
}

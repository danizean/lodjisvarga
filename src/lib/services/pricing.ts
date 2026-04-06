import { createClient } from "@/lib/supabase/server";

interface PricingParams {
  roomTypeId: string;
  checkIn: Date;
  checkOut: Date;
}

interface PriceBreakdown {
  basePrice: number;
  nights: number;
  effectivePrice: number;
  totalPrice: number;
}

/**
 * Calculate the total price for a stay.
 * base_price lives on room_types (not villas).
 * room_prices can override the price for specific dates.
 */
export async function calculatePrice(params: PricingParams): Promise<PriceBreakdown> {
  const supabase = await createClient();

  const nights = Math.ceil(
    (params.checkOut.getTime() - params.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Fetch room type base price
  const { data: roomType } = await supabase
    .from("room_types")
    .select("base_price")
    .eq("id", params.roomTypeId)
    .single();

  const basePrice = roomType?.base_price ?? 0;

  // Fetch seasonal pricing override (first one found in range)
  const { data: roomPrice } = await supabase
    .from("room_prices")
    .select("price")
    .eq("room_type_id", params.roomTypeId)
    .gte("date", params.checkIn.toISOString().split("T")[0])
    .lt("date", params.checkOut.toISOString().split("T")[0])
    .order("price", { ascending: false })
    .limit(1)
    .maybeSingle();

  const effectivePrice = roomPrice?.price ?? basePrice;

  return {
    basePrice,
    nights,
    effectivePrice,
    totalPrice: effectivePrice * nights,
  };
}

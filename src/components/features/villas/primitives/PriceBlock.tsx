import type { ReactNode } from "react";
import { resolveRoomDisplayPricing, type ResolvedRoomPricing } from "@/lib/mappers/public-villas";
import type { RoomTypeCardData } from "@/types/public-villas";

type PriceInput = Pick<
  RoomTypeCardData,
  "base_price" | "effective_price" | "price_source" | "activePromo"
>;

interface PriceBlockProps {
  room: PriceInput;
  children: (pricing: ResolvedRoomPricing) => ReactNode;
}

export function PriceBlock({ room, children }: PriceBlockProps) {
  const pricing = resolveRoomDisplayPricing(room);
  return <>{children(pricing)}</>;
}


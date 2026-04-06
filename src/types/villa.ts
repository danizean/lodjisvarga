import type { Database } from "./database";

export type Villa = Database["public"]["Tables"]["villas"]["Row"];
export type VillaInsert = Database["public"]["Tables"]["villas"]["Insert"];
export type VillaUpdate = Database["public"]["Tables"]["villas"]["Update"];

// Extended type for villa with joined data
export interface VillaWithPricing extends Villa {
  currentPrice?: number;
  isAvailable?: boolean;
}

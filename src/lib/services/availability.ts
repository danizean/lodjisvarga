import { getBlockedDates } from "@/lib/queries/availability";

/**
 * Merges blocked_dates from the DB with confirmed booking date ranges
 * to produce a unified list of unavailable dates for the calendar UI.
 */
export async function getUnavailableDates(villaId: string): Promise<Date[]> {
  const blocked = await getBlockedDates(villaId);
  // TODO: Also fetch confirmed booking date ranges and expand to individual dates
  return blocked;
}

export function isDateInRange(date: Date, from: Date, to: Date): boolean {
  return date >= from && date <= to;
}

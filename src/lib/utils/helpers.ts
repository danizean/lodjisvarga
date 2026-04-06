/**
 * Creates an array of dates between two dates (inclusive).
 */
export function getDatesInRange(from: Date, to: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(from);
  while (current <= to) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Checks if two date ranges overlap.
 */
export function doRangesOverlap(
  rangeA: { from: Date; to: Date },
  rangeB: { from: Date; to: Date }
): boolean {
  return rangeA.from < rangeB.to && rangeA.to > rangeB.from;
}

/**
 * Type-safe object entries helper.
 */
export function typedEntries<T extends object>(obj: T) {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

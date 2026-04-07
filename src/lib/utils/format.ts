/**
 * Format a number as Indonesian Rupiah.
 * Example: formatIDR(1500000) → "Rp 1.500.000"
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date to Indonesian locale.
 * Example: formatDate(new Date()) → "7 April 2025"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format a date range as a readable string.
 */
export function formatDateRange(from: Date, to: Date): string {
  return `${formatDate(from)} – ${formatDate(to)}`;
}

/**
 * Calculate number of nights between two dates.
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
}

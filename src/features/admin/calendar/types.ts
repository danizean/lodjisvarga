export type ApplyTo = "all" | "weekdays" | "weekends";

export interface AdminCalendarRoom {
  id: string;
  name: string;
  base_price: number;
  villaId: string;
  villaName: string;
}

export interface CalendarReservationInfo {
  id: string;
  status: string | null;
  customerName: string | null;
}

export interface CalendarDayState {
  date: string;
  effectivePrice: number;
  basePrice: number;
  priceSource: "base" | "override";
  isBlocked: boolean;
  blockReason: string | null;
  reservation: CalendarReservationInfo | null;
}

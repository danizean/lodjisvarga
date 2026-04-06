import type { Database } from "./database";

// The actual booking table in this schema is "reservations"
export type Reservation = Database["public"]["Tables"]["reservations"]["Row"];
export type ReservationInsert = Database["public"]["Tables"]["reservations"]["Insert"];
export type ReservationUpdate = Database["public"]["Tables"]["reservations"]["Update"];

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

// Alias for DX clarity
export type Booking = Reservation;

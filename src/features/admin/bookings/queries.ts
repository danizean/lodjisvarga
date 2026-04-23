import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 20;

export async function getAdminBookingsPageData(page: number) {
  const supabase = await createClient();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ data: reservations, count, error }, { data: leads, error: leadsError }] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        "id, room_type_id, customer_name, customer_phone, check_in, check_out, total_price, total_nights, reservation_status, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("leads")
      .select("id, villa_id, customer_name, customer_phone, check_in, check_out, total_price, status, created_at")
      .or("status.eq.New,status.eq.new,status.eq.FollowUp,status.eq.followup")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  if (leadsError) {
    throw new Error(leadsError.message);
  }

  const roomTypeIds = Array.from(new Set((reservations ?? []).map((reservation) => reservation.room_type_id)));
  const leadVillaIds = (leads ?? [])
    .map((lead) => lead.villa_id)
    .filter((value): value is string => Boolean(value));

  const { data: roomTypes, error: roomTypesError } = roomTypeIds.length
    ? await supabase
        .from("room_types")
        .select("id, name, villa_id")
        .in("id", roomTypeIds)
    : { data: [], error: null };

  if (roomTypesError) {
    throw new Error(roomTypesError.message);
  }

  const allVillaIds = Array.from(
    new Set([
      ...leadVillaIds,
      ...(roomTypes ?? []).map((roomType) => roomType.villa_id).filter((value): value is string => Boolean(value)),
    ])
  );

  const { data: villas, error: villasError } = allVillaIds.length
    ? await supabase
        .from("villas")
        .select("id, name")
        .in("id", allVillaIds)
    : { data: [], error: null };

  if (villasError) {
    throw new Error(villasError.message);
  }

  const villaMap = new Map((villas ?? []).map((villa) => [villa.id, villa.name]));
  const roomTypeMap = new Map(
    (roomTypes ?? []).map((roomType) => [
      roomType.id,
      {
        name: roomType.name,
        villaName: roomType.villa_id ? villaMap.get(roomType.villa_id) ?? "Villa tidak ditemukan" : "Villa belum ditautkan",
      },
    ])
  );

  return {
    page: safePage,
    pageSize: PAGE_SIZE,
    totalReservations: count ?? 0,
    reservations: (reservations ?? []).map((reservation) => ({
      ...reservation,
      roomTypeName: roomTypeMap.get(reservation.room_type_id)?.name ?? "Tipe unit tidak ditemukan",
      villaName: roomTypeMap.get(reservation.room_type_id)?.villaName ?? "Villa tidak ditemukan",
    })),
    leads: (leads ?? []).map((lead) => ({
      ...lead,
      villaName: lead.villa_id ? villaMap.get(lead.villa_id) ?? "Villa tidak ditemukan" : "Belum ditentukan",
    })),
  };
}

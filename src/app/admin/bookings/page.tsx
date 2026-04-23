import { CalendarDays, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AdminEmptyState,
  AdminPageShell,
  AdminSection,
} from "@/components/admin/ui/AdminPageShell";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminLinkButton } from "@/components/admin/ui/AdminLinkButton";
import { getAdminBookingsPageData } from "@/features/admin/bookings/queries";
import { formatIDR } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

function BookingStatusBadge({ status }: { status: string | null }) {
  const normalized = status?.toLowerCase();

  if (normalized === "confirmed") {
    return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Confirmed</Badge>;
  }

  if (normalized === "pending") {
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
  }

  if (normalized === "cancelled") {
    return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Cancelled</Badge>;
  }

  return <Badge variant="outline">{status ?? "Unknown"}</Badge>;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; status?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawPage = Array.isArray(params.page) ? params.page[0] : params.page;
  const rawStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q;

  const currentPage = Number(rawPage ?? "1");
  const activeStatus = (rawStatus ?? "all").toLowerCase();
  const keyword = (rawQuery ?? "").trim().toLowerCase();

  const { reservations, leads, page, pageSize, totalReservations } = await getAdminBookingsPageData(currentPage);

  const filteredReservations = reservations.filter((reservation) => {
    const byStatus =
      activeStatus === "all"
        ? true
        : (reservation.reservation_status ?? "").toLowerCase() === activeStatus;

    const byKeyword =
      keyword.length === 0
        ? true
        : `${reservation.customer_name ?? ""} ${reservation.customer_phone ?? ""} ${reservation.villaName} ${reservation.roomTypeName}`
            .toLowerCase()
            .includes(keyword);

    return byStatus && byKeyword;
  });

  const totalPages = Math.max(1, Math.ceil(totalReservations / pageSize));

  return (
    <AdminPageShell
      title="Bookings"
      description="Monitoring reservasi dan lead dengan tindakan cepat untuk tim operasional."
      actions={
        <AdminLinkButton href="/admin/calendar" variant="outline" size="sm">
          <CalendarDays className="h-4 w-4" />
          Buka Calendar
        </AdminLinkButton>
      }
    >
      <AdminSection title="Filter" description="Persempit data untuk mempercepat review harian">
        <form className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto]" action="/admin/bookings" method="get">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="q"
              defaultValue={rawQuery ?? ""}
              placeholder="Cari nama tamu, telepon, villa, atau tipe unit"
              className="h-10 rounded-xl border-slate-200 bg-white pl-10"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              name="status"
              defaultValue={activeStatus}
              className="h-10 bg-transparent text-sm text-slate-700 outline-none"
            >
              <option value="all">Semua status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <AdminButton type="submit" size="lg" className="rounded-xl">
            Terapkan
          </AdminButton>
          <input type="hidden" name="page" value="1" />
        </form>
      </AdminSection>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <AdminSection
          title="Reservasi"
          description={`${filteredReservations.length} data ditampilkan`}
          action={<Badge variant="outline">Total {totalReservations}</Badge>}
        >
          {filteredReservations.length === 0 ? (
            <div className="px-5 py-4">
              <AdminEmptyState
                title="Reservasi tidak ditemukan"
                description="Ubah filter atau kata kunci untuk melihat data lain."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.06em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Guest</th>
                    <th className="px-5 py-3">Property</th>
                    <th className="px-5 py-3">Stay</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-t border-slate-100 align-top text-sm">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{reservation.customer_name ?? "Guest tanpa nama"}</p>
                        <p className="text-xs text-slate-500">{reservation.customer_phone ?? "Nomor belum ada"}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-900">{reservation.villaName}</p>
                        <p className="text-xs text-slate-500">{reservation.roomTypeName}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-slate-800">{reservation.check_in} - {reservation.check_out}</p>
                        <p className="text-xs text-slate-500">
                          {reservation.total_nights ?? 0} malam - {formatIDR(reservation.total_price)}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <BookingStatusBadge status={reservation.reservation_status} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <AdminButton variant="outline" size="sm">Detail</AdminButton>
                          <AdminButton size="sm">Follow up</AdminButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">Halaman {page} dari {totalPages}</p>
            <div className="flex gap-2">
              {page <= 1 ? (
                <AdminButton variant="outline" size="sm" disabled>
                  Sebelumnya
                </AdminButton>
              ) : (
                <AdminLinkButton
                  href={`/admin/bookings?page=${Math.max(1, page - 1)}&status=${activeStatus}&q=${encodeURIComponent(rawQuery ?? "")}`}
                  variant="outline"
                  size="sm"
                >
                  Sebelumnya
                </AdminLinkButton>
              )}
              {page >= totalPages ? (
                <AdminButton variant="outline" size="sm" disabled>
                  Berikutnya
                </AdminButton>
              ) : (
                <AdminLinkButton
                  href={`/admin/bookings?page=${Math.min(totalPages, page + 1)}&status=${activeStatus}&q=${encodeURIComponent(rawQuery ?? "")}`}
                  variant="outline"
                  size="sm"
                >
                  Berikutnya
                </AdminLinkButton>
              )}
            </div>
          </div>
        </AdminSection>

        <AdminSection
          title="Lead Perlu Follow Up"
          description="Lead baru yang belum ditutup"
        >
          {leads.length === 0 ? (
            <div className="px-5 py-4">
              <AdminEmptyState
                title="Tidak ada lead aktif"
                description="Semua lead sudah diproses atau belum ada lead masuk."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <article key={lead.id} className="space-y-2 px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{lead.customer_name ?? "Lead tanpa nama"}</p>
                    <Badge variant="outline">{lead.status ?? "Unknown"}</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{lead.villaName}</p>
                  <p className="text-xs text-slate-500">
                    {lead.check_in ?? "-"} - {lead.check_out ?? "-"}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-700">{formatIDR(lead.total_price ?? 0)}</p>
                    <AdminButton variant="outline" size="sm">WhatsApp</AdminButton>
                  </div>
                </article>
              ))}
            </div>
          )}
        </AdminSection>
      </div>
    </AdminPageShell>
  );
}

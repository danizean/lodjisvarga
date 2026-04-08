import { PricingWorkspace } from "@/components/admin/PricingWorkspace";
import { getAdminVillasWithRooms } from "@/lib/queries/villas";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const villas = await getAdminVillasWithRooms();
  const rooms = villas.flatMap((villa) =>
    (villa.room_types ?? [])
      .filter((room) => room.status !== "inactive")
      .map((room) => ({
        id: room.id,
        name: room.name,
        base_price: room.base_price,
        villaId: villa.id,
        villaName: villa.name,
      }))
  );

  return (
    <div className="min-h-screen bg-[#F7F6F2] px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-[#3A4A1F]/10 p-3">
            <CalendarDays className="h-6 w-6 text-[#3A4A1F]" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Calendar & Pricing</h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola harga harian dan availability semua tipe kamar dari satu halaman.
            </p>
          </div>
        </div>
      </div>

      {rooms.length > 0 ? (
        <PricingWorkspace rooms={rooms} />
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
          <CalendarDays className="mx-auto mb-4 h-14 w-14 text-slate-200" />
          <h2 className="text-lg font-bold text-slate-700">Belum ada tipe kamar aktif</h2>
          <p className="mt-2 text-sm text-slate-400">Tambahkan room type terlebih dahulu di Property Management.</p>
        </div>
      )}
    </div>
  );
}

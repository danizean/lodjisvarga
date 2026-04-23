import { CalendarDays } from "lucide-react";
import { PricingWorkspace } from "@/components/admin/PricingWorkspace";
import { AdminEmptyState, AdminPageShell } from "@/components/admin/ui/AdminPageShell";
import { getAdminCalendarRooms } from "@/features/admin/calendar/queries";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const rooms = await getAdminCalendarRooms();

  return (
    <AdminPageShell
      title="Calendar & Pricing"
      description="Kelola harga harian, blocked dates, dan status booking dari satu workspace."
    >
      {rooms.length > 0 ? (
        <PricingWorkspace rooms={rooms} />
      ) : (
        <div className="admin-surface p-5">
          <AdminEmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="Belum ada tipe kamar aktif"
            description="Tambahkan room type aktif terlebih dahulu di halaman villas agar bisa dikelola di kalender."
          />
        </div>
      )}
    </AdminPageShell>
  );
}

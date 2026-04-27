import Image from "next/image";
import { BedDouble, Building2, CalendarDays, Edit2, ImageIcon, Plus } from "lucide-react";
import { AdminEmptyState, AdminPageShell, AdminSection } from "@/components/admin/ui/AdminPageShell";
import { AdminLinkButton } from "@/components/admin/ui/AdminLinkButton";
import { Badge } from "@/components/ui/badge";
import { VillaStatusToggle } from "@/components/admin/villas/VillaStatusToggle";
import { getAdminVillasWithRooms } from "@/lib/queries/villas";

export const dynamic = "force-dynamic";

interface AdminRoomType {
  id: string;
  name: string;
  status: string | null;
}

interface AdminGalleryItem {
  image_url: string;
  is_primary: boolean | null;
  room_type_id: string | null;
}

interface AdminVilla {
  id: string;
  name: string;
  address: string | null;
  status: string | null;
  villa_gallery: AdminGalleryItem[] | null;
  room_types: AdminRoomType[] | null;
}

export default async function AdminVillasPage() {
  const villas = (await getAdminVillasWithRooms()) as AdminVilla[];

  const activeVillas = villas.filter((villa) => {
    const status = villa.status?.toLowerCase();
    return status === "active" || status === "published";
  }).length;

  const totalRooms = villas.reduce((accumulator, villa) => {
    const roomCount = (villa.room_types ?? []).filter((room) => room.status !== "inactive").length;
    return accumulator + roomCount;
  }, 0);

  const totalPhotos = villas.reduce((accumulator, villa) => {
    return accumulator + (villa.villa_gallery?.filter((item) => !item.room_type_id).length ?? 0);
  }, 0);

  return (
    <AdminPageShell
      title="Villa Management"
      description="Kelola properti, unit kamar, dan kesiapan inventori untuk tim reservasi."
      actions={
        <>
          <AdminLinkButton href="/admin/calendar" variant="outline" size="sm">
            <CalendarDays className="h-4 w-4" />
            Calendar & Pricing
          </AdminLinkButton>
          <AdminLinkButton href="/admin/villas/new" variant="default" size="sm">
            <Plus className="h-4 w-4" />
            Tambah Properti
          </AdminLinkButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="admin-surface p-4">
          <p className="text-xs font-medium text-slate-500">Total Properti</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{villas.length}</p>
        </div>
        <div className="admin-surface p-4">
          <p className="text-xs font-medium text-slate-500">Properti Aktif</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-700">{activeVillas}</p>
        </div>
        <div className="admin-surface p-4">
          <p className="text-xs font-medium text-slate-500">Total Unit Aktif</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalRooms}</p>
        </div>
      </div>

      <AdminSection
        title="Daftar Properti"
        description="Format hybrid untuk scanning cepat dan action langsung"
        action={<Badge variant="outline">{totalPhotos} foto</Badge>}
      >
        {villas.length === 0 ? (
          <div className="px-5 py-4">
            <AdminEmptyState
              icon={<Building2 className="h-10 w-10" />}
              title="Belum ada properti"
              description="Mulai dengan menambahkan villa pertama agar tim bisa setup harga dan booking."
              action={
                <AdminLinkButton href="/admin/villas/new" variant="default" size="sm">
                  Tambah Properti
                </AdminLinkButton>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {villas.map((villa) => {
              const activeRooms = (villa.room_types ?? []).filter((room) => room.status !== "inactive");
              const primaryImage = villa.villa_gallery?.find((item) => item.is_primary && !item.room_type_id);
              const villaPhotoCount = villa.villa_gallery?.filter((item) => !item.room_type_id).length ?? 0;

              return (
                <article key={villa.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[180px_1fr_auto] lg:items-center">
                  <div className="relative h-28 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {primaryImage ? (
                      <Image
                        src={primaryImage.image_url}
                        alt={villa.name}
                        fill
                        sizes="180px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-slate-900">{villa.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500">{villa.address || "Alamat belum diisi"}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                        <BedDouble className="h-3.5 w-3.5" />
                        {activeRooms.length} tipe kamar aktif
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {villaPhotoCount} foto villa
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    {/* Inline status toggle — optimistic, no reload */}
                    <VillaStatusToggle
                      villaId={villa.id}
                      villaName={villa.name}
                      currentStatus={villa.status}
                    />
                    <div className="flex gap-2">
                      <AdminLinkButton href={`/admin/villas/${villa.id}/edit`} variant="outline" size="sm">
                        <Edit2 className="h-3.5 w-3.5" />
                        Edit
                      </AdminLinkButton>
                      <AdminLinkButton href="/admin/calendar" variant="outline" size="sm">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Calendar
                      </AdminLinkButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </AdminSection>
    </AdminPageShell>
  );
}

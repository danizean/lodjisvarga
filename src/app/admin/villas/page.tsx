import Link from "next/link";
import Image from "next/image";
import { getAdminVillasWithRooms } from "@/lib/queries/villas";
import { Button } from "@/components/ui/button";
import { Edit2, Plus, Building2, BedDouble, CalendarDays, ImageIcon } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { StatusBadge } from "@/components/admin/StatusBadge";

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

  return (
    <Container className="py-8 space-y-6 bg-[#F7F6F2] min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#3A4A1F]/10 p-3 rounded-xl">
            <Building2 className="w-6 h-6 text-[#3A4A1F]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Property Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">{villas.length} properti terdaftar</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/calendar">
            <Button variant="outline" className="rounded-xl border-[#3A4A1F]/30 font-bold text-[#3A4A1F]">
              <CalendarDays className="w-4 h-4 mr-2" /> Kalender Harga
            </Button>
          </Link>
          <Link href="/admin/villas/new">
            <Button className="bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-xl shadow-md font-bold transition-all">
              <Plus className="w-4 h-4 mr-2" /> Tambah Properti
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Villas */}
      {villas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {villas.map((villa) => {
            const primaryImage = villa.villa_gallery?.find((g) => g.is_primary && !g.room_type_id);
            const activeRooms = villa.room_types?.filter((rt) => rt.status !== "inactive") ?? [];
            const totalVillaPhotos = villa.villa_gallery?.filter((g) => !g.room_type_id).length ?? 0;

            return (
              <div key={villa.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all group">
                {/* Image */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {primaryImage ? (
                    <Image
                      src={primaryImage.image_url}
                      alt={villa.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={villa.status} variant="villa" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{villa.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">📍 {villa.address || "Alamat belum diisi"}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Tipe Kamar</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{activeRooms.length}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Foto Villa</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{totalVillaPhotos}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Inventori Aktif</p>
                    {activeRooms.slice(0, 2).map((rt) => (
                      <div key={rt.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5 text-xs">
                        <span className="flex items-center gap-1 text-slate-600">
                          <BedDouble className="w-3 h-3" /> {rt.name}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 font-bold text-slate-500 ring-1 ring-slate-200">
                          <ImageIcon className="h-3 w-3" />
                          Kelola
                        </span>
                      </div>
                    ))}
                    {activeRooms.length > 2 && (
                      <p className="text-[10px] text-slate-400">+{activeRooms.length - 2} tipe kamar lainnya</p>
                    )}
                    {activeRooms.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Belum ada kamar</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <Link href={`/admin/villas/${villa.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full h-9 text-xs font-bold text-[#3A4A1F] border-[#3A4A1F]/30 hover:bg-[#3A4A1F] hover:text-white rounded-xl transition-all">
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Properti
                      </Button>
                    </Link>
                    <Link href="/admin/calendar" className="flex-1">
                      <Button variant="outline" className="w-full h-9 text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all">
                        <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Kalender
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center">
          <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Belum ada properti</h3>
          <p className="text-slate-400 mt-2 text-sm">Mulai dengan menambahkan villa pertama Anda.</p>
          <Link href="/admin/villas/new">
            <Button className="mt-6 bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-xl font-bold">
              <Plus className="w-4 h-4 mr-2" /> Tambah Properti Pertama
            </Button>
          </Link>
        </div>
      )}
    </Container>
  );
}

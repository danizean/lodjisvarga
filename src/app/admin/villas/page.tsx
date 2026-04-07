import Link from "next/link";
import { getAdminVillasWithRooms } from "@/lib/queries/villas";
import { formatIDR } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Edit2, Plus, Building2, BedDouble } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminVillasPage() {
  const villas = await getAdminVillasWithRooms();

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
        <Link href="/admin/villas/new">
          <Button className="bg-[#3A4A1F] hover:bg-[#2A3A1F] text-white rounded-xl shadow-md font-bold transition-all">
            <Plus className="w-4 h-4 mr-2" /> Tambah Properti
          </Button>
        </Link>
      </div>

      {/* Grid Villas */}
      {villas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {villas.map((villa: any) => {
            const primaryImage = villa.gallery?.find((g: any) => g.is_primary && !g.room_type_id);
            const activeRooms = villa.room_types?.filter((rt: any) => rt.status !== "inactive") ?? [];

            return (
              <div key={villa.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all group">
                {/* Image */}
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {primaryImage ? (
                    <img src={primaryImage.image_url} alt={villa.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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

                  {/* Room types preview */}
                  <div className="mt-3 space-y-1">
                    {activeRooms.slice(0, 2).map((rt: any) => (
                      <div key={rt.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-slate-600">
                          <BedDouble className="w-3 h-3" /> {rt.name}
                        </span>
                        <span className="font-bold text-[#3A4A1F]">{formatIDR(rt.base_price)}/mlm</span>
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
                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <Link href={`/admin/villas/${villa.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full h-9 text-xs font-bold text-[#3A4A1F] border-[#3A4A1F]/30 hover:bg-[#3A4A1F] hover:text-white rounded-xl transition-all">
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Properti
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

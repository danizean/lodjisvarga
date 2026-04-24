"use client";

import { use, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BedDouble, Plus, Loader2, Users, AlertTriangle, Waves } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addRoomTypeToVilla, deleteRoomType } from "@/lib/actions/villas";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RoomSummary {
  id: string;
  name: string;
  bed_type: string;
  hasPool: boolean;
  base_price: number;
  gallery_count: number;
}

export default function VillaRoomsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadRooms = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("room_types")
      .select(`
        id, name, bed_type, base_price,
        room_gallery:gallery!gallery_room_type_id_fkey(id),
        room_type_amenities(amenities(name))
      `)
      .eq("villa_id", id)
      .neq("status", "inactive")
      .order("created_at");

    if (error) {
      toast.error("Gagal memuat data kamar");
      setLoading(false);
      return;
    }

    setRooms(
      (data ?? []).map((r) => {
        const hasPool = (r.room_type_amenities as any[])?.some(
          (rta) => rta.amenities?.name?.toLowerCase().includes("pool")
        );

        return {
          id: r.id,
          name: r.name,
          bed_type: r.bed_type ?? "Belum diset",
          hasPool,
          base_price: r.base_price ?? 0,
          gallery_count: Array.isArray(r.room_gallery) ? r.room_gallery.length : 0,
        };
      })
    );
    setLoading(false);
  };

  useEffect(() => {
    loadRooms();
  }, [id]);

  const handleAddRoom = () => {
    startTransition(async () => {
      const res = await addRoomTypeToVilla({
        villa_id: id,
        name: "New Room Type",
        base_price: 0,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }
      
      toast.success("Tipe kamar berhasil ditambahkan");
      if (res.data) {
        router.push(`/admin/villas/${id}/rooms/${res.data.id}`);
      }
    });
  };

  const handleDeleteRoom = (roomId: string) => {
    startTransition(async () => {
      const res = await deleteRoomType(roomId);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Tipe kamar berhasil dihapus");
      loadRooms();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4A1F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Room Inventory</h2>
          <p className="text-sm text-slate-500">Kelola tipe kamar, fasilitas, dan galeri masing-masing unit.</p>
        </div>
        <Button 
          onClick={handleAddRoom} 
          disabled={isPending}
          className="h-11 rounded-xl bg-[#3A4A1F] px-4 text-xs font-bold text-white hover:bg-[#2E3C18]"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Tambah Kamar Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#3A4A1F]/30 hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <BedDouble className="h-5 w-5" />
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger render={
                  <button className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                } />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus tipe kamar ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tipe kamar "{room.name}" akan dihapus. Jika sudah ada reservasi, data ini hanya akan diarsipkan (soft delete) untuk menjaga histori.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteRoom(room.id)} className="bg-red-600 hover:bg-red-700">
                      Hapus Kamar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <Link href={`/admin/villas/${id}/rooms/${room.id}`} className="block">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#3A4A1F] transition-colors">{room.name}</h3>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-100">
                  <BedDouble className="h-3 w-3" />
                  {room.bed_type}
                </div>
                {room.hasPool && (
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-100/50">
                    <Waves className="h-3 w-3" />
                    Private Pool
                  </div>
                )}
                <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-100">
                  <span className="font-semibold">{room.gallery_count}</span> Foto
                </div>
              </div>
            </Link>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <BedDouble className="mx-auto h-12 w-12 text-slate-200" />
            <p className="mt-4 text-lg font-black text-slate-800">Belum ada tipe kamar</p>
            <p className="mt-2 text-sm text-slate-500">Tambahkan minimal satu kamar agar listing bisa dijual.</p>
            <Button onClick={handleAddRoom} disabled={isPending} className="mt-5 h-11 rounded-xl bg-[#3A4A1F] px-5 text-sm font-bold text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Tambah Kamar Pertama
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

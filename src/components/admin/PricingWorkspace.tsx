"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Hotel, BedDouble } from "lucide-react";
import { PricingCalendar } from "@/components/admin/PricingCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PricingWorkspaceRoom {
  id: string;
  name: string;
  base_price: number;
  villaId: string;
  villaName: string;
}

interface PricingWorkspaceProps {
  rooms: PricingWorkspaceRoom[];
}

export function PricingWorkspace({ rooms }: PricingWorkspaceProps) {
  const initialRoom = rooms[0] ?? null;
  const [selectedVillaId, setSelectedVillaId] = useState(initialRoom?.villaId ?? "");
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoom?.id ?? "");

  const villas = useMemo(
    () =>
      Array.from(
        new Map(rooms.map((room) => [room.villaId, { id: room.villaId, name: room.villaName }])).values()
      ),
    [rooms]
  );

  const filteredRooms = useMemo(
    () => rooms.filter((room) => room.villaId === selectedVillaId),
    [rooms, selectedVillaId]
  );

  const selectedRoom =
    filteredRooms.find((room) => room.id === selectedRoomId) ??
    filteredRooms[0] ??
    initialRoom;

  const handleVillaChange = (villaId: string) => {
    setSelectedVillaId(villaId);
    const firstRoom = rooms.find((room) => room.villaId === villaId);
    if (firstRoom) setSelectedRoomId(firstRoom.id);
  };

  if (!selectedRoom) {
    return (
      <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-white p-16 text-center">
        <CalendarDays className="mx-auto mb-4 h-14 w-14 text-slate-200" />
        <h2 className="text-lg font-bold text-slate-700">Belum ada room type aktif</h2>
        <p className="mt-2 text-sm text-slate-400">Tambahkan tipe kamar dulu dari Property Management.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-8 xl:h-fit">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3A4A1F]">Navigator</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Pilih Villa & Kamar</h2>
          <p className="mt-1 text-xs text-slate-500">Semua perubahan rate dan maintenance dilakukan per tipe kamar.</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Villa</label>
            <Select value={selectedVillaId} onValueChange={(value) => value && handleVillaChange(value)}>
              <SelectTrigger className="h-11 rounded-2xl bg-slate-50">
                <SelectValue placeholder="Pilih villa" />
              </SelectTrigger>
              <SelectContent>
                {villas.map((villa) => (
                  <SelectItem key={villa.id} value={villa.id}>
                    {villa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Tipe Kamar</label>
            <Select value={selectedRoom.id} onValueChange={(value) => value && setSelectedRoomId(value)}>
              <SelectTrigger className="h-11 rounded-2xl bg-slate-50">
                <SelectValue placeholder="Pilih kamar" />
              </SelectTrigger>
              <SelectContent>
                {filteredRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-2 text-white/70">
            <Hotel className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em]">Villa Terpilih</p>
          </div>
          <p className="mt-2 text-sm font-black">{selectedRoom.villaName}</p>
          <div className="mt-4 flex items-center gap-2 text-white/70">
            <BedDouble className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.18em]">Kamar Aktif</p>
          </div>
          <p className="mt-2 text-sm font-black">{selectedRoom.name}</p>
        </div>

        <div className="space-y-2">
          {filteredRooms.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelectedRoomId(room.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                room.id === selectedRoom.id
                  ? "border-[#3A4A1F] bg-[#3A4A1F]/5 shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <p className="text-sm font-bold text-slate-900">{room.name}</p>
              <p className="mt-1 text-[11px] text-slate-500">Kelola harga dan maintenance untuk kamar ini</p>
            </button>
          ))}
        </div>
      </aside>

      <main className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3A4A1F]">{selectedRoom.villaName}</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{selectedRoom.name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Workspace ini khusus untuk price rate dan availability. Property Management tetap fokus ke data villa dan kamar.
          </p>
        </div>

        <PricingCalendar roomTypeId={selectedRoom.id} basePrice={selectedRoom.base_price} />
      </main>
    </div>
  );
}

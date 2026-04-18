"use client";

import { useMemo, useState, useEffect } from "react";
import { 
  CalendarDays, 
  Hotel, 
  BedDouble, 
  ChevronRight, 
  Info,
  LayoutDashboard,
  Circle
} from "lucide-react";
import { PricingCalendar } from "@/components/admin/PricingCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- Types ---
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

export function PricingWorkspace({ rooms = [] }: PricingWorkspaceProps) {
  // 1. State Management
  const [selectedVillaId, setSelectedVillaId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");

  // 2. Data Processing (Memoized)
  const villas = useMemo(() => {
    const villaMap = new Map<string, { id: string; name: string }>();
    rooms.forEach((room) => {
      if (!villaMap.has(room.villaId)) {
        villaMap.set(room.villaId, { id: room.villaId, name: room.villaName });
      }
    });
    return Array.from(villaMap.values());
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => room.villaId === selectedVillaId);
  }, [rooms, selectedVillaId]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  // 3. Sync Logic (Empathy for User Flow)
  useEffect(() => {
    if (rooms.length > 0 && !selectedVillaId) {
      setSelectedVillaId(rooms[0].villaId);
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedVillaId]);

  const handleVillaChange = (villaId: string) => {
    setSelectedVillaId(villaId);
    const firstRoom = rooms.find((r) => r.villaId === villaId);
    if (firstRoom) setSelectedRoomId(firstRoom.id);
  };

  // 4. Guard: Empty State
  if (rooms.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-white p-12 text-center">
        <CalendarDays className="h-12 w-12 text-slate-200" />
        <h2 className="mt-4 text-lg font-bold text-slate-900">Data Tidak Ditemukan</h2>
        <p className="mt-1 text-sm text-slate-500">Silakan tambahkan unit kamar terlebih dahulu.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      {/* SIDEBAR: NAVIGATOR */}
      <aside className="space-y-6">
        <div className="sticky top-8 space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-5">
            <header>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-3.5 w-3.5 text-[#3A4A1F]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3A4A1F]">Navigator</span>
              </div>
              <h2 className="mt-1 text-lg font-black text-slate-950">Pilih Unit</h2>
            </header>

            <div className="space-y-4">
              {/* Villa Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Properti</label>
                <Select value={selectedVillaId} onValueChange={handleVillaChange}>
                  <SelectTrigger className="h-11 rounded-2xl bg-slate-50 border-transparent font-bold text-slate-900">
                    <SelectValue placeholder="Pilih Villa" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                    {villas.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="rounded-xl font-semibold">
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Info Card */}
              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <div className="flex items-center gap-2 opacity-50">
                  <Hotel className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Villa Aktif</span>
                </div>
                <p className="mt-1 text-sm font-black truncate">{selectedRoom?.villaName || "-"}</p>
                
                <div className="mt-4 flex items-center gap-2 opacity-50">
                  <BedDouble className="h-3 w-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Kamar Aktif</span>
                </div>
                <p className="mt-1 text-sm font-black truncate">{selectedRoom?.name || "-"}</p>
              </div>
            </div>
          </div>

          {/* Room Selection List */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2">Tipe Kamar</p>
            <div className="space-y-1.5">
              {filteredRooms.map((room) => {
                const isActive = room.id === selectedRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all",
                      isActive
                        ? "border-[#3A4A1F] bg-[#3A4A1F] text-white shadow-md shadow-[#3A4A1F]/20"
                        : "border-transparent bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className="space-y-0.5">
                      <p className={cn("text-sm font-bold", isActive ? "text-white" : "text-slate-900")}>
                        {room.name}
                      </p>
                      <p className={cn("text-[10px] font-medium", isActive ? "text-white/60" : "text-slate-400")}>
                        Rp {room.base_price / 1000}k / malam
                      </p>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 opacity-50 transition-transform", isActive && "translate-x-1 opacity-100")} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN: WORKSPACE */}
      <main className="space-y-6">
        {selectedRoom ? (
          <>
            {/* Context Header */}
            <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3A4A1F]">
                      {selectedRoom.villaName}
                    </span>
                    <Circle className="h-1 w-1 fill-slate-300 text-slate-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace</span>
                  </div>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    {selectedRoom.name}
                  </h1>
                </div>
                
                <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 border border-amber-100 text-amber-700">
                  <Info className="h-4 w-4 shrink-0" />
                  <p className="text-[11px] font-bold leading-tight">
                    Update harga & ketersediaan <br />untuk unit ini secara real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Calendar Core */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <PricingCalendar 
                key={selectedRoom.id} // Re-mount calendar saat kamar berubah
                roomTypeId={selectedRoom.id} 
                basePrice={selectedRoom.base_price} 
              />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center p-20 text-slate-300">
            Pilih unit kamar untuk memulai...
          </div>
        )}
      </main>
    </div>
  );
}
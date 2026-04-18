"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { 
  CalendarDays, 
  BedDouble, 
  ChevronRight, 
  Search,
  LayoutDashboard,
  Circle,
  Info // Ikon ini yang sebelumnya tertinggal
} from "lucide-react";
import { PricingCalendar } from "@/components/admin/PricingCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const [selectedVillaId, setSelectedVillaId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

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
    return rooms.filter((room) => {
      const matchVilla = room.villaId === selectedVillaId;
      const matchSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchVilla && matchSearch;
    });
  }, [rooms, selectedVillaId, searchQuery]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    if (rooms.length > 0 && !selectedVillaId) {
      setSelectedVillaId(rooms[0].villaId);
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedVillaId]);

  const handleVillaChange = useCallback((villaId: string) => {
    setSelectedVillaId(villaId);
    const firstRoom = rooms.find((r) => r.villaId === villaId);
    if (firstRoom) setSelectedRoomId(firstRoom.id);
  }, [rooms]);

  if (rooms.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 w-full max-w-[1600px] mx-auto p-4 lg:p-6 animate-in fade-in duration-700">
      
      {/* SINGLE COMPACT HEADER: Menghapus redundansi visual */}
      <header className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl bg-[#3A4A1F] flex items-center justify-center text-white shadow-md shadow-[#3A4A1F]/20">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#3A4A1F]">Admin</span>
              <Circle className="h-1 w-1 fill-slate-300 text-slate-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Hub</span>
            </div>
            <h1 className="text-xl font-black text-slate-950 tracking-tight">Manajemen Harga & Kalender</h1>
          </div>
        </div>

        {selectedRoom && (
          <div className="mt-4 md:mt-0 flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Villa Terpilih</p>
                <p className="text-xs font-black text-slate-900 mt-1">{selectedRoom.villaName}</p>
             </div>
             <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
             <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-[#3A4A1F] uppercase leading-none italic">Unit Aktif</p>
                <p className="text-sm font-black text-[#3A4A1F]">{selectedRoom.name}</p>
             </div>
          </div>
        )}
      </header>

      {/* BODY GRID */}
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        
        {/* SIDEBAR NAVIGATOR */}
        <aside className="space-y-5">
          <div className="sticky top-6 space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Pilih Properti</label>
                <Select value={selectedVillaId} onValueChange={handleVillaChange}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-transparent font-bold text-sm">
                    <SelectValue placeholder="Pilih Villa" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {villas.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="font-semibold text-sm">{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input 
                  placeholder="Cari tipe unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-xl border-slate-100 bg-slate-50 pl-10 text-xs focus-visible:ring-1"
                />
              </div>

              <div className="space-y-1.5 pt-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                <p className="text-[10px] font-black uppercase text-slate-300 ml-1 mb-2">Daftar Kamar</p>
                {filteredRooms.map((room) => {
                  const isActive = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left",
                        isActive 
                          ? "bg-[#3A4A1F] text-white shadow-lg shadow-[#3A4A1F]/20 translate-x-1" 
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className="truncate">
                        <p className={cn("text-xs font-black", isActive ? "text-white" : "text-slate-900")}>{room.name}</p>
                        <p className={cn("text-[9px] font-bold mt-1", isActive ? "text-white/60" : "text-slate-400")}>
                          Dasar: Rp {room.base_price / 1000}k
                        </p>
                      </div>
                      <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 ml-2 transition-transform", isActive ? "translate-x-0" : "-translate-x-2 opacity-0")} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* QUICK INFO (Tips) */}
            <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100 flex gap-3">
               <Info className="h-4 w-4 text-amber-600 shrink-0" />
               <p className="text-[10px] font-bold text-amber-700 leading-tight italic">
                  Tip: Pilih rentang tanggal di kalender untuk melakukan update harga massal atau menutup ketersediaan.
               </p>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="min-w-0">
          {selectedRoom ? (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <PricingCalendar 
                key={selectedRoom.id}
                roomTypeId={selectedRoom.id} 
                basePrice={selectedRoom.base_price} 
              />
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center rounded-[24px] bg-white border border-dashed border-slate-200">
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pilih unit untuk mulai mengelola...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
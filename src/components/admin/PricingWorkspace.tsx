"use client";

import { useCallback, useMemo, useState } from "react";
import {
  BedDouble,
  ChevronRight,
  Info,
  LayoutDashboard,
  MapPin,
  Search,
  Settings2,
} from "lucide-react";
import { PricingCalendar } from "@/components/admin/PricingCalendar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const initialVillaId = rooms[0]?.villaId ?? "";
  const initialRoomId = rooms[0]?.id ?? "";

  const [selectedVillaId, setSelectedVillaId] = useState(initialVillaId);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [searchQuery, setSearchQuery] = useState("");

  const villas = useMemo(() => {
    const grouped = new Map<string, { id: string; name: string }>();
    for (const room of rooms) {
      if (!grouped.has(room.villaId)) {
        grouped.set(room.villaId, { id: room.villaId, name: room.villaName });
      }
    }
    return Array.from(grouped.values());
  }, [rooms]);

  const activeVillaId = selectedVillaId || initialVillaId;

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchVilla = room.villaId === activeVillaId;
      const matchSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchVilla && matchSearch;
    });
  }, [rooms, activeVillaId, searchQuery]);

  const selectedRoom = useMemo(() => {
    const bySelectedId = rooms.find((room) => room.id === selectedRoomId);
    if (bySelectedId) return bySelectedId;
    return filteredRooms[0] ?? rooms[0] ?? null;
  }, [rooms, selectedRoomId, filteredRooms]);

  const handleVillaChange = useCallback(
    (villaId: string | null) => {
      if (!villaId) {
        return;
      }
      setSelectedVillaId(villaId);
      const firstRoom = rooms.find((room) => room.villaId === villaId);
      if (firstRoom) {
        setSelectedRoomId(firstRoom.id);
      }
    },
    [rooms]
  );

  if (rooms.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
      <aside className="space-y-4 xl:sticky xl:top-20 xl:h-fit">
        <section className="admin-surface p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--admin-primary-soft)] text-[var(--admin-primary)]">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--admin-primary)]">Pricing Center</p>
              <p className="text-sm font-semibold text-slate-900">Pilih unit lalu atur harga dan availability</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="text-xs font-medium text-slate-600">Properti</label>
            <Select value={activeVillaId} onValueChange={handleVillaChange}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder="Pilih villa" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {villas.map((villa) => (
                  <SelectItem key={villa.id} value={villa.id}>
                    {villa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari tipe unit"
                className="h-10 rounded-xl border-slate-200 bg-white pl-10"
              />
            </div>
          </div>
        </section>

        <section className="admin-surface p-2">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-xs font-medium text-slate-500">Tipe Unit</p>
            <BadgeCounter count={filteredRooms.length} />
          </div>

          <div className="max-h-[420px] space-y-1 overflow-y-auto px-1 pb-1">
            {filteredRooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-500">
                Tipe unit tidak ditemukan.
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isActive = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors",
                      isActive
                        ? "bg-[var(--admin-primary)] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{room.name}</p>
                      <p className={cn("text-xs", isActive ? "text-white/80" : "text-slate-500")}>
                        Base {new Intl.NumberFormat("id-ID").format(room.base_price)}
                      </p>
                    </div>
                    <ChevronRight className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-400")} />
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Harga dan blocked dates akan langsung memengaruhi ketersediaan publik, jadi lakukan update per rentang tanggal dengan hati-hati.
          </p>
        </section>
      </aside>

      <main className="min-w-0 space-y-4">
        <section className="admin-surface flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Unit Aktif</p>
            <p className="text-lg font-semibold text-slate-900">{selectedRoom?.name ?? "Pilih Unit"}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              {selectedRoom?.villaName ?? "Belum memilih villa"}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <BedDouble className="h-4 w-4" />
            Base price {new Intl.NumberFormat("id-ID").format(selectedRoom?.base_price ?? 0)}
          </div>
        </section>

        {selectedRoom ? (
          <PricingCalendar key={selectedRoom.id} roomTypeId={selectedRoom.id} basePrice={selectedRoom.base_price} />
        ) : (
          <section className="admin-surface flex h-[420px] flex-col items-center justify-center gap-2 text-slate-400">
            <Settings2 className="h-10 w-10" />
            <p className="text-sm font-medium">Pilih unit untuk mulai mengatur kalender</p>
          </section>
        )}
      </main>
    </div>
  );
}

function BadgeCounter({ count }: { count: number }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-600">
      {count}
    </span>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format as formatDate,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  isBefore,
} from "date-fns";
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  RotateCcw, 
  TrendingUp,
  CheckCircle2,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import {
  blockDates,
  bulkUpsertPrices,
  clearPriceOverrides,
  getPricingCalendarData,
  unblockDates,
} from "@/features/admin/calendar/actions";
import type { ApplyTo, CalendarDayState } from "@/features/admin/calendar/types";
import { formatIDR } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

interface PricingCalendarProps {
  roomTypeId: string;
  basePrice: number;
}

// --- Constants ---
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const PRICE_PRESETS = [500000, 750000, 1000000, 1500000, 2000000, 2500000];

// --- Utils ---
const getDateKey = (date: Date) => formatDate(date, "yyyy-MM-dd");
const parseRupiahInput = (value: string) => Number(value.replace(/\D/g, "")) || 0;
const formatRupiahInput = (value: number) => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

const isCustomWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 5 || day === 6 || day === 0; // Fri, Sat, Sun
};

export function PricingCalendar({
  roomTypeId,
  basePrice,
}: PricingCalendarProps) {
  const [activeTab, setActiveTab] = useState<"price" | "block">("price");
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState(0);
  const [blockReason, setBlockReason] = useState("Maintenance");
  const [applyTo, setApplyTo] = useState<ApplyTo>("all");
  const [days, setDays] = useState<CalendarDayState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const calendarDays = useMemo(() => {
    const firstGridDay = startOfWeek(startOfMonth(displayMonth), { weekStartsOn: 1 });
    const lastGridDay = endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: firstGridDay, end: lastGridDay });
  }, [displayMonth]);

  const dayMap = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
  const selectedRangeDays = useMemo(() => {
    if (!startDate || !endDate) return [];

    return days.filter((day) => day.date >= startDate && day.date <= endDate);
  }, [days, endDate, startDate]);
  const targetedSelectionDays = useMemo(() => {
    if (applyTo === "all") {
      return selectedRangeDays;
    }

    return selectedRangeDays.filter((day) => {
      const date = parseISO(day.date);
      return applyTo === "weekdays" ? !isCustomWeekend(date) : isCustomWeekend(date);
    });
  }, [applyTo, selectedRangeDays]);

  const selectedDaysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    try {
      const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      if (applyTo === "weekdays") return interval.filter(d => !isCustomWeekend(d)).length;
      if (applyTo === "weekends") return interval.filter(d => isCustomWeekend(d)).length;
      return interval.length;
    } catch { return 0; }
  }, [startDate, endDate, applyTo]);

  const hasBookedDatesInSelection = targetedSelectionDays.some((day) => Boolean(day.reservation));
  const hasBlockedDatesInSelection = targetedSelectionDays.some((day) => day.isBlocked);

  const refreshCalendar = useCallback(async (targetMonth: Date, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await getPricingCalendarData(roomTypeId, targetMonth.getFullYear(), targetMonth.getMonth() + 1);
      if (result.error) toast.error(result.error);
      else setDays(result.days || []);
    } catch { toast.error("Koneksi gagal."); }
    finally { setIsLoading(false); }
  }, [roomTypeId]);

  useEffect(() => { refreshCalendar(displayMonth, true); }, [displayMonth, refreshCalendar]);

  const handleSelectDay = (date: Date) => {
    const key = getDateKey(date);
    if (!startDate || (startDate && endDate)) {
      setStartDate(key);
      setEndDate("");
    } else {
      if (isBefore(date, parseISO(startDate))) {
        setEndDate(startDate);
        setStartDate(key);
      } else {
        setEndDate(key);
      }
    }
  };

  const runMutation = (operation: () => Promise<{ error?: string | null }>) => {
    if (!startDate || !endDate) {
      toast.error("Tentukan rentang tanggal terlebih dahulu.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await operation();
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Berhasil disimpan.");
          refreshCalendar(displayMonth, true);
        }
      } catch {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  const handleBulkPrice = () => {
    if (price <= 0) return toast.error("Masukkan nominal harga yang valid.");
    if (hasBookedDatesInSelection) return toast.error("Tidak bisa mengubah harga pada tanggal yang sudah ter-booking.");
    runMutation(() => bulkUpsertPrices({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      price,
      apply_to: applyTo,
    }));
  };

  const handleBlockDates = () => {
    if (hasBookedDatesInSelection) return toast.error("Tidak bisa memblokir tanggal yang sudah ter-booking.");
    if (hasBlockedDatesInSelection) return toast.error("Ada tanggal yang sudah diblokir dalam rentang ini.");
    runMutation(() => blockDates({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      reason: blockReason || "Maintenance",
      apply_to: applyTo,
    }));
  };

  const handleUnblockDates = () => runMutation(() => unblockDates(roomTypeId, startDate, endDate, applyTo));
  const handleClearPrice = () => runMutation(() => clearPriceOverrides(roomTypeId, startDate, endDate, applyTo));

  return (
    <div className="admin-surface space-y-6 p-4 sm:p-5">
      
      {/* 1. Header Area */}
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--admin-primary)]">
            <CircleIcon />
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em]">Manajemen Inventori</p>
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Ketersediaan & Harga</h3>
        </div>
        <div className="flex items-center gap-2">
            <AdminButton
                variant="ghost"
                onClick={() => {setStartDate(""); setEndDate("");}}
                size="sm"
            >
                Reset Pilihan
            </AdminButton>
            <AdminButton
              variant="outline"
              size="sm"
              onClick={() => refreshCalendar(displayMonth)}
              disabled={isLoading}
              className="border-slate-200"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Sinkronkan
            </AdminButton>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        
        {/* 2. Calendar View (Left Side) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2">
            <AdminButton variant="ghost" size="icon-sm" onClick={() => setDisplayMonth(subMonths(displayMonth, 1))} className="rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </AdminButton>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-[0.06em]">
              {formatDate(displayMonth, "MMMM yyyy")}
            </h4>
            <AdminButton variant="ghost" size="icon-sm" onClick={() => setDisplayMonth(addMonths(displayMonth, 1))} className="rounded-lg">
              <ChevronRight className="h-5 w-5" />
            </AdminButton>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((day) => (
              <div key={day} className="pb-1 text-center text-[11px] font-medium uppercase text-slate-400">{day}</div>
            ))}
            {calendarDays.map((date) => {
              const dKey = getDateKey(date);
              const isCurr = isSameMonth(date, displayMonth);
              const isSelected = startDate === dKey || endDate === dKey;
              const inRange = startDate && endDate && dKey >= startDate && dKey <= endDate;
              const day = dayMap.get(dKey);
              const priceVal = day?.effectivePrice ?? basePrice;
              const blocked = day?.isBlocked ? day.blockReason ?? "Blocked" : null;
              const booked = Boolean(day?.reservation);
              const isExcluded = (applyTo === "weekdays" && isCustomWeekend(date)) || (applyTo === "weekends" && !isCustomWeekend(date));

              return (
                <button
                  key={dKey}
                  type="button"
                  onClick={() => handleSelectDay(date)}
                  className={cn(
                    "group relative flex min-h-[98px] flex-col rounded-xl border p-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primary)]/40",
                    isCurr ? "bg-white border-slate-100 shadow-sm" : "bg-transparent border-transparent opacity-20",
                    inRange && "bg-emerald-50/40 border-emerald-100 ring-1 ring-emerald-200",
                    isSelected && "ring-2 ring-slate-900 border-transparent z-10",
                    isToday(date) && "bg-blue-50/50 border-blue-200 ring-offset-2",
                    booked && !blocked && "border-amber-200 bg-amber-50/60",
                    blocked && "border-red-200 bg-red-50/70",
                    inRange && isExcluded && "opacity-40"
                  )}
                >
                  <span className={cn("text-xs font-semibold", isToday(date) ? "text-blue-600 underline" : "text-slate-900")}>
                    {formatDate(date, "d")}
                  </span>

                  <div className="mt-auto space-y-1.5">
                    {blocked ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span className="text-[10px] font-semibold uppercase text-red-600 truncate">Terblokir</span>
                      </div>
                    ) : booked ? (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-semibold uppercase text-amber-700 truncate">Booked</p>
                        <p className="text-[11px] font-medium text-amber-600 truncate">
                          {day?.reservation?.customerName || "Reservasi aktif"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className={cn("text-xs font-semibold tracking-tight", priceVal ? "text-emerald-700" : "text-slate-400")}>
                          {formatIDR(priceVal).replace("Rp", "").trim()}
                        </p>
                        {day?.priceSource === "override" && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Controls (Right Side Panel) */}
        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-xl bg-slate-900 p-4 text-white shadow-sm">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                <CalendarDays size={64} />
             </div>
             <div className="relative space-y-4">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/50">Periode Seleksi</p>
                    <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold">{startDate ? formatDate(parseISO(startDate), "dd MMM") : "..."}</h4>
                        <ChevronRight className="h-4 w-4 text-white/20" />
                        <h4 className="text-lg font-semibold">{endDate ? formatDate(parseISO(endDate), "dd MMM") : "..."}</h4>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                        <p className="text-2xl font-semibold text-emerald-400 leading-none">{selectedDaysCount}</p>
                        <p className="mt-1 text-[11px] font-medium uppercase text-white/40">Hari Terdampak</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-medium uppercase text-white/40 leading-none">Strategi</p>
                        <p className="mt-1 text-xs font-semibold text-blue-300">{applyTo.toUpperCase()}</p>
                    </div>
                </div>
             </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
            <div className="flex rounded-xl bg-slate-100 p-1">
              {["all", "weekdays", "weekends"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setApplyTo(t as ApplyTo)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-[11px] font-medium uppercase transition-all",
                    applyTo === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t === 'all' ? 'Semua' : t === 'weekdays' ? 'Hari Kerja' : 'Weekend'}
                </button>
              ))}
            </div>

            <div className="flex gap-4 border-b border-slate-100 pb-2">
              <button 
                type="button"
                onClick={() => setActiveTab("price")} 
                className={cn("pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition-all", activeTab === "price" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
              >
                Ubah Harga
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab("block")} 
                className={cn("pb-2 text-[11px] font-semibold uppercase tracking-[0.06em] transition-all", activeTab === "block" ? "text-red-600 border-b-2 border-red-600" : "text-slate-400")}
              >
                Availability
              </button>
            </div>

            {activeTab === "price" ? (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-medium uppercase text-slate-500">Nominal Harga</label>
                  <Input 
                    value={formatRupiahInput(price)} 
                    onChange={(e) => setPrice(parseRupiahInput(e.target.value))} 
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm font-semibold focus-visible:ring-emerald-500" 
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_PRESETS.map((p) => (
                    <button type="button" key={p} onClick={() => setPrice(p)} className="rounded-lg border border-slate-200 py-2 text-[11px] font-medium transition-colors hover:bg-emerald-50">
                      {p/1000}k
                    </button>
                  ))}
                </div>
                <AdminButton onClick={handleBulkPrice} size="lg" disabled={isPending || hasBookedDatesInSelection} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {isPending ? <Loader2 className="animate-spin mr-2" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                  PERBARUI HARGA
                </AdminButton>
                <AdminButton onClick={handleClearPrice} size="default" disabled={isPending} variant="outline" className="w-full border-slate-200">
                  Hapus Override Harga
                </AdminButton>
              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-medium uppercase text-slate-500">Keterangan Block</label>
                  <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50" />
                </div>
                <AdminButton variant="destructive" size="lg" onClick={handleBlockDates} disabled={isPending || hasBookedDatesInSelection || hasBlockedDatesInSelection} className="w-full">
                  TUTUP PENJUALAN
                </AdminButton>
                <AdminButton variant="outline" size="default" onClick={handleUnblockDates} disabled={isPending} className="w-full border-slate-200">
                  BUKA BLOKIR (OPEN)
                </AdminButton>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-[11px] font-medium text-slate-600 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Harga override aktif
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Sudah ada reservasi
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Tanggal diblokir manual
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3">
             <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[11px] font-medium text-amber-700 leading-snug">
                Kalender ini sekarang menampilkan harga efektif, blok manual, dan tanggal yang sudah terisi reservasi agar tim tidak mengubah inventori secara konflik.
             </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CircleIcon() {
  return (
    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
  );
}

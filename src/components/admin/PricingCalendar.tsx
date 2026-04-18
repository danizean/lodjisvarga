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
  Ban, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  RotateCcw, 
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  blockDates,
  bulkUpsertPrices,
  clearPriceOverrides,
  getPricingCalendarData,
  unblockDates,
} from "@/lib/actions/pricing";
import { formatIDR } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

// --- Types ---
interface PriceEntry {
  date: string;
  price: number;
}

interface BlockedEntry {
  date: string;
  reason?: string | null;
}

interface PricingCalendarProps {
  roomTypeId: string;
  basePrice: number;
  existingPrices?: PriceEntry[];
  blockedDates?: BlockedEntry[];
}

// --- Constants ---
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const PRICE_PRESETS = [500000, 750000, 1000000, 1500000, 2000000, 2500000];

// --- Utils Internal ---
const getDateKey = (date: Date) => formatDate(date, "yyyy-MM-dd");
const parseRupiahInput = (value: string) => Number(value.replace(/\D/g, "")) || 0;
const formatRupiahInput = (value: number) => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

export function PricingCalendar({
  roomTypeId,
  existingPrices = [],
  blockedDates: initialBlockedDates = [],
}: PricingCalendarProps) {
  // UI States
  const [activeTab, setActiveTab] = useState<"price" | "block">("price");
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState(0);
  const [blockReason, setBlockReason] = useState("Maintenance");
  const [applyTo, setApplyTo] = useState<"all" | "weekdays" | "weekends">("all");
  
  // Data States
  const [prices, setPrices] = useState<PriceEntry[]>(existingPrices);
  const [blockedDates, setBlockedDates] = useState<BlockedEntry[]>(initialBlockedDates);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Memoized Calendar Data
  const monthLabel = formatDate(displayMonth, "MMMM yyyy");
  
  const selectedDaysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    try {
      return eachDayOfInterval({ 
        start: parseISO(startDate), 
        end: parseISO(endDate) 
      }).length;
    } catch (e) {
      return 0;
    }
  }, [startDate, endDate]);

  const calendarDays = useMemo(() => {
    const firstGridDay = startOfWeek(startOfMonth(displayMonth), { weekStartsOn: 1 });
    const lastGridDay = endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: firstGridDay, end: lastGridDay });
  }, [displayMonth]);

  const priceMap = useMemo(() => new Map(prices.map((entry) => [entry.date, entry.price])), [prices]);
  const blockedMap = useMemo(
    () => new Map(blockedDates.map((entry) => [entry.date, entry.reason ?? "Blocked"])),
    [blockedDates]
  );

  // --- Handlers ---
  const refreshCalendar = useCallback(async (targetMonth: Date, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const year = targetMonth.getFullYear();
      const month = targetMonth.getMonth() + 1;
      const result = await getPricingCalendarData(roomTypeId, year, month);

      if (result.error) {
        toast.error(result.error);
      } else {
        setPrices(result.prices || []);
        setBlockedDates(result.blockedDates || []);
      }
    } catch (error) {
      toast.error("Gagal mengambil data kalender.");
    } finally {
      setIsLoading(false);
    }
  }, [roomTypeId]);

  useEffect(() => {
    refreshCalendar(displayMonth, true);
  }, [displayMonth, refreshCalendar]);

  const selectDay = (date: Date) => {
    const selected = getDateKey(date);

    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate("");
      return;
    }

    if (isBefore(date, parseISO(startDate))) {
      setEndDate(startDate);
      setStartDate(selected);
      return;
    }

    setEndDate(selected);
  };

  const selectFullMonth = () => {
    setStartDate(getDateKey(startOfMonth(displayMonth)));
    setEndDate(getDateKey(endOfMonth(displayMonth)));
  };

  const validateRange = () => {
    if (!startDate || !endDate) {
      toast.error("Pilih rentang tanggal di kalender terlebih dahulu.");
      return false;
    }
    return true;
  };

  const runMutation = (operation: () => Promise<{ error?: string; days_updated?: number; success?: boolean }>) => {
    if (!validateRange()) return;

    startTransition(async () => {
      try {
        const result = await operation();
        if (result.error) {
          toast.error(result.error);
          return;
        }

        const daysText = result.days_updated ? ` (${result.days_updated} tanggal)` : "";
        toast.success(`Berhasil diperbarui${daysText}.`);
        await refreshCalendar(displayMonth, true);
      } catch (error) {
        toast.error("Terjadi kesalahan saat menyimpan data.");
      }
    });
  };

  const handleBulkPrice = () => {
    if (price < 0) return toast.error("Harga tidak valid.");
    runMutation(() => bulkUpsertPrices({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      price,
      apply_to: applyTo,
    }));
  };

  const handleBlockDates = () => {
    runMutation(() => blockDates({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      reason: blockReason || "Maintenance",
      apply_to: applyTo,
    }));
  };

  const handleUnblockDates = () => runMutation(() => unblockDates(roomTypeId, startDate, endDate));
  const handleClearPrice = () => runMutation(() => clearPriceOverrides(roomTypeId, startDate, endDate));

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3A4A1F]">Rate Operations</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">Harga & Ketersediaan</h3>
          <p className="mt-1 text-xs text-slate-500">Klik tanggal untuk mulai memilih rentang periode.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => refreshCalendar(displayMonth)}
          disabled={isLoading}
          className="rounded-xl border-slate-200 bg-slate-50 font-bold text-slate-600"
        >
          {isLoading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-2 h-3.5 w-3.5" />}
          Refresh Data
        </Button>
      </div>

      {/* STRATEGY FILTER */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1.5">
        {[
          { label: "Semua Hari", value: "all" },
          { label: "Hari Kerja", value: "weekdays" },
          { label: "Akhir Pekan", value: "weekends" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setApplyTo(option.value as typeof applyTo)}
            className={cn(
              "rounded-lg py-2 text-[11px] font-bold transition-all",
              applyTo === option.value ? "bg-slate-950 text-white shadow-sm" : "text-slate-500 hover:bg-white"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_350px]">
        {/* LEFT: CALENDAR VIEW */}
        <div className="rounded-[24px] border border-slate-100 bg-slate-50/60 p-4">
          <div className="mb-4 flex items-center justify-between px-2">
            <Button variant="ghost" size="icon" onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <button type="button" onClick={selectFullMonth} className="text-sm font-black text-slate-900 hover:text-[#3A4A1F]">
              {monthLabel}
            </button>
            <Button variant="ghost" size="icon" onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold uppercase text-slate-400">
            {WEEKDAYS.map((day) => <div key={day} className="py-2">{day}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((date) => {
              const dateKey = getDateKey(date);
              const overridePrice = priceMap.get(dateKey);
              const blockedReason = blockedMap.get(dateKey);
              const isCurrentMonth = isSameMonth(date, displayMonth);
              
              const isSelected = startDate === dateKey || endDate === dateKey;
              const inRange = startDate && endDate && dateKey >= startDate && dateKey <= endDate;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => selectDay(date)}
                  className={cn(
                    "group relative flex min-h-[100px] flex-col rounded-2xl border p-2 text-left transition-all",
                    isCurrentMonth ? "border-white bg-white shadow-sm" : "border-transparent bg-transparent opacity-30",
                    inRange && "bg-emerald-50/80 ring-1 ring-emerald-200",
                    isSelected && "ring-2 ring-slate-950 z-10",
                    isToday(date) && !isSelected && "border-blue-200 bg-blue-50/30"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={cn(
                      "text-xs font-black", 
                      isToday(date) ? "text-blue-600" : isCurrentMonth ? "text-slate-700" : "text-slate-300"
                    )}>
                      {formatDate(date, "d")}
                    </span>
                    {blockedReason && <Ban className="h-3 w-3 text-red-500" />}
                  </div>

                  <div className="mt-auto pt-2 space-y-1 w-full overflow-hidden">
                    {blockedReason ? (
                      <p className="truncate text-[8px] font-bold uppercase text-red-600">Terblokir</p>
                    ) : (
                      <>
                        <p className={cn("truncate text-[10px] font-black", overridePrice ? "text-emerald-700" : "text-slate-400")}>
                          {overridePrice ? formatIDR(overridePrice).replace("Rp", "").trim() : "Base Rate"}
                        </p>
                        {overridePrice && (
                          <div className="flex items-center gap-0.5">
                            <CheckCircle2 className="h-2 w-2 text-emerald-500" />
                            <span className="text-[7px] font-bold uppercase text-emerald-600">Custom</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: CONTROL PANEL */}
        <aside className="space-y-4">
          {/* SELECTION INFO CARD */}
          <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Periode Terpilih</p>
            <div className="mt-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-white/70">Mulai - Selesai</p>
                <p className="text-sm font-black">{startDate || "..."} — {endDate || "..."}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-emerald-400">{selectedDaysCount}</p>
                <p className="text-[10px] font-bold uppercase">Malam</p>
              </div>
            </div>
          </div>

          {/* ACTION TABS */}
          <div className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm space-y-5">
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("price")}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-xs font-bold transition-all",
                  activeTab === "price" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
                )}
              >
                <TrendingUp className="mr-1.5 inline h-3.5 w-3.5" /> Harga
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("block")}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-xs font-bold transition-all",
                  activeTab === "block" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"
                )}
              >
                <Ban className="mr-1.5 inline h-3.5 w-3.5" /> Status
              </button>
            </div>

            {activeTab === "price" ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Atur Harga Baru</label>
                  <div className="relative">
                    <Input
                      inputMode="numeric"
                      value={formatRupiahInput(price)}
                      onChange={(e) => setPrice(parseRupiahInput(e.target.value))}
                      className="h-14 rounded-2xl bg-slate-50 px-4 text-xl font-black text-slate-900 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {PRICE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPrice(preset)}
                      className="rounded-xl border border-slate-100 bg-slate-50 py-2.5 text-[10px] font-black text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      {preset/1000}k
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <Button 
                    onClick={handleBulkPrice} 
                    disabled={isPending} 
                    className="w-full h-12 rounded-xl bg-emerald-700 font-bold text-white hover:bg-emerald-800"
                  >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                    Terapkan Harga
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleClearPrice} 
                    disabled={isPending} 
                    className="w-full h-10 rounded-xl text-xs font-bold text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    Reset ke Harga Dasar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Alasan Pemblokiran</label>
                  <Input 
                    value={blockReason} 
                    onChange={(e) => setBlockReason(e.target.value)} 
                    placeholder="Contoh: Maintenance..."
                    className="h-12 rounded-xl"
                  />
                </div>
                
                <div className="grid gap-2 pt-2">
                  <Button 
                    variant="destructive"
                    onClick={handleBlockDates} 
                    disabled={isPending} 
                    className="h-12 rounded-xl font-bold"
                  >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                    Block Tanggal
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleUnblockDates} 
                    disabled={isPending} 
                    className="h-12 rounded-xl border-slate-200 font-bold text-slate-600"
                  >
                    Buka Blokir (Open)
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
            <h5 className="text-[10px] font-black uppercase text-amber-800">Tips</h5>
            <p className="mt-1 text-[10px] leading-relaxed text-amber-700/80">
              Gunakan mode <b>Hari Kerja</b> atau <b>Akhir Pekan</b> untuk memperbarui harga secara spesifik tanpa mengubah tanggal lainnya dalam rentang yang dipilih.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
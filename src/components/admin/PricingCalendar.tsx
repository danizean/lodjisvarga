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
  isWeekend,
} from "date-fns";
import { 
  Ban, 
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
interface PriceEntry { date: string; price: number; }
interface BlockedEntry { date: string; reason?: string | null; }

interface PricingCalendarProps {
  roomTypeId: string;
  basePrice: number;
  existingPrices?: PriceEntry[];
  blockedDates?: BlockedEntry[];
}

// --- Constants ---
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const PRICE_PRESETS = [500000, 750000, 1000000, 1500000, 2000000, 2500000];

// --- Utils ---
const getDateKey = (date: Date) => formatDate(date, "yyyy-MM-dd");
const parseRupiahInput = (value: string) => Number(value.replace(/\D/g, "")) || 0;
const formatRupiahInput = (value: number) => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

export function PricingCalendar({
  roomTypeId,
  existingPrices = [],
  blockedDates: initialBlockedDates = [],
}: PricingCalendarProps) {
  // --- States ---
  const [activeTab, setActiveTab] = useState<"price" | "block">("price");
  const [displayMonth, setDisplayMonth] = useState(startOfMonth(new Date()));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState(0);
  const [blockReason, setBlockReason] = useState("Maintenance");
  const [applyTo, setApplyTo] = useState<"all" | "weekdays" | "weekends">("all");
  
  const [prices, setPrices] = useState<PriceEntry[]>(existingPrices);
  const [blockedDates, setBlockedDates] = useState<BlockedEntry[]>(initialBlockedDates);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- Memos ---
  const calendarDays = useMemo(() => {
    const firstGridDay = startOfWeek(startOfMonth(displayMonth), { weekStartsOn: 1 });
    const lastGridDay = endOfWeek(endOfMonth(displayMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: firstGridDay, end: lastGridDay });
  }, [displayMonth]);

  const priceMap = useMemo(() => new Map(prices.map((p) => [p.date, p.price])), [prices]);
  const blockedMap = useMemo(() => new Map(blockedDates.map((b) => [b.date, b.reason ?? "Blocked"])), [blockedDates]);

  const selectedDaysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    try {
      const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
      if (applyTo === "weekdays") return interval.filter(d => !isWeekend(d)).length;
      if (applyTo === "weekends") return interval.filter(d => isWeekend(d)).length;
      return interval.length;
    } catch { return 0; }
  }, [startDate, endDate, applyTo]);

  // --- Handlers ---
  const refreshCalendar = useCallback(async (targetMonth: Date, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const result = await getPricingCalendarData(roomTypeId, targetMonth.getFullYear(), targetMonth.getMonth() + 1);
      if (result.error) toast.error(result.error);
      else {
        setPrices(result.prices || []);
        setBlockedDates(result.blockedDates || []);
      }
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

  const runMutation = (operation: () => Promise<any>) => {
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
      } catch (e) {
        toast.error("Terjadi kesalahan sistem.");
      }
    });
  };

  const handleBulkPrice = () => {
    if (price <= 0) return toast.error("Masukkan nominal harga yang valid.");
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
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600">
            <CircleIcon />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Manajemen Inventori</p>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Ketersediaan & Harga</h3>
        </div>
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                onClick={() => {setStartDate(""); setEndDate("");}}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
                Reset Pilihan
            </Button>
            <Button
              variant="outline"
              onClick={() => refreshCalendar(displayMonth)}
              disabled={isLoading}
              className="rounded-2xl border-slate-200 shadow-sm font-bold h-11 px-6"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
              Sinkronkan
            </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        
        {/* 2. Calendar View (Left Side) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
            <Button variant="ghost" size="icon" onClick={() => setDisplayMonth(subMonths(displayMonth, 1))} className="rounded-xl">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {formatDate(displayMonth, "MMMM yyyy")}
            </h4>
            <Button variant="ghost" size="icon" onClick={() => setDisplayMonth(addMonths(displayMonth, 1))} className="rounded-xl">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase pb-2">{day}</div>
            ))}
            {calendarDays.map((date) => {
              const dKey = getDateKey(date);
              const isCurr = isSameMonth(date, displayMonth);
              const isSelected = startDate === dKey || endDate === dKey;
              const inRange = startDate && endDate && dKey >= startDate && dKey <= endDate;
              const priceVal = priceMap.get(dKey);
              const blocked = blockedMap.get(dKey);
              const isExcluded = (applyTo === "weekdays" && isWeekend(date)) || (applyTo === "weekends" && !isWeekend(date));

              return (
                <button
                  key={dKey}
                  onClick={() => handleSelectDay(date)}
                  className={cn(
                    "group relative flex min-h-[110px] flex-col rounded-[20px] border p-3 text-left transition-all duration-200",
                    isCurr ? "bg-white border-slate-100 shadow-sm" : "bg-transparent border-transparent opacity-20",
                    inRange && "bg-emerald-50/40 border-emerald-100 ring-1 ring-emerald-200",
                    isSelected && "ring-2 ring-slate-950 border-transparent z-10 scale-[1.03] shadow-lg",
                    isToday(date) && "bg-blue-50/50 border-blue-200 ring-offset-2",
                    inRange && isExcluded && "opacity-40"
                  )}
                >
                  <span className={cn("text-xs font-black", isToday(date) ? "text-blue-600 underline" : "text-slate-900")}>
                    {formatDate(date, "d")}
                  </span>

                  <div className="mt-auto space-y-1.5">
                    {blocked ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <span className="text-[8px] font-black uppercase text-red-600 truncate">Terblokir</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className={cn("text-[11px] font-black tracking-tight", priceVal ? "text-emerald-700" : "text-slate-400")}>
                          {priceVal ? formatIDR(priceVal).replace("Rp", "").trim() : "Dasar"}
                        </p>
                        {priceVal && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Controls (Right Side Panel) */}
        <aside className="space-y-6">
          <div className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <CalendarDays size={80} />
             </div>
             <div className="relative space-y-4">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Periode Seleksi</p>
                    <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold">{startDate ? formatDate(parseISO(startDate), "dd MMM") : "..."}</h4>
                        <ChevronRight className="h-4 w-4 text-white/20" />
                        <h4 className="text-lg font-bold">{endDate ? formatDate(parseISO(endDate), "dd MMM") : "..."}</h4>
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                        <p className="text-2xl font-black text-emerald-400 leading-none">{selectedDaysCount}</p>
                        <p className="text-[9px] font-bold uppercase text-white/40 mt-1 tracking-tighter">Hari Terdampak</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-white/40 leading-none">Strategi</p>
                        <p className="text-xs font-black mt-1 text-blue-300">{applyTo.toUpperCase()}</p>
                    </div>
                </div>
             </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 space-y-6">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              {["all", "weekdays", "weekends"].map((t) => (
                <button
                  key={t}
                  onClick={() => setApplyTo(t as any)}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase transition-all rounded-xl",
                    applyTo === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t === 'all' ? 'Semua' : t === 'weekdays' ? 'Hari Kerja' : 'Weekend'}
                </button>
              ))}
            </div>

            <div className="flex gap-4 border-b border-slate-100 pb-2">
              <button 
                onClick={() => setActiveTab("price")} 
                className={cn("pb-2 text-xs font-black uppercase tracking-widest transition-all", activeTab === "price" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400")}
              >
                Ubah Harga
              </button>
              <button 
                onClick={() => setActiveTab("block")} 
                className={cn("pb-2 text-xs font-black uppercase tracking-widest transition-all", activeTab === "block" ? "text-red-600 border-b-2 border-red-600" : "text-slate-400")}
              >
                Availability
              </button>
            </div>

            {activeTab === "price" ? (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nominal Harga</label>
                  <Input 
                    value={formatRupiahInput(price)} 
                    onChange={(e) => setPrice(parseRupiahInput(e.target.value))} 
                    className="h-14 rounded-2xl bg-slate-50 text-xl font-black border-none focus-visible:ring-emerald-500" 
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_PRESETS.map((p) => (
                    <button key={p} onClick={() => setPrice(p)} className="rounded-xl border border-slate-100 py-3 text-[10px] font-black hover:bg-emerald-50 transition-colors">
                      {p/1000}k
                    </button>
                  ))}
                </div>
                <Button onClick={handleBulkPrice} disabled={isPending} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black shadow-lg shadow-emerald-100">
                  {isPending ? <Loader2 className="animate-spin mr-2" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                  PERBARUI HARGA
                </Button>
              </div>
            ) : (
              <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Keterangan Block</label>
                  <Input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="h-12 rounded-2xl bg-slate-50 border-none" />
                </div>
                <Button variant="destructive" onClick={handleBlockDates} disabled={isPending} className="w-full h-14 rounded-2xl font-black shadow-lg shadow-red-100">
                  TUTUP PENJUALAN
                </Button>
                <Button variant="outline" onClick={handleUnblockDates} disabled={isPending} className="w-full h-12 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">
                  BUKA BLOKIR (OPEN)
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100 flex gap-3">
             <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
             <p className="text-[10px] font-bold text-amber-700 italic leading-snug">
                Pilih tanggal di kalender, lalu terapkan harga atau block ketersediaan untuk periode tersebut.
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
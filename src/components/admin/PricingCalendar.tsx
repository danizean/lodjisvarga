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
} from "date-fns";
import { Ban, CalendarDays, ChevronLeft, ChevronRight, Loader2, RotateCcw, TrendingUp } from "lucide-react";
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

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const PRICE_PRESETS = [500000, 750000, 1000000, 1500000, 2000000, 2500000];

const getDateKey = (date: Date) => formatDate(date, "yyyy-MM-dd");
const parseRupiahInput = (value: string) => Number(value.replace(/\D/g, "")) || 0;
const formatRupiahInput = (value: number) => `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;

const countSelectedNights = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  return eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) }).length;
};

export function PricingCalendar({
  roomTypeId,
  existingPrices = [],
  blockedDates: initialBlockedDates = [],
}: PricingCalendarProps) {
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

  const monthLabel = formatDate(displayMonth, "MMMM yyyy");
  const selectedDays = countSelectedNights(startDate, endDate);

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

  const refreshCalendar = useCallback(async (nextMonth: Date, silent = false) => {
    if (!silent) setIsLoading(true);
    const year = nextMonth.getFullYear();
    const month = nextMonth.getMonth() + 1;
    const result = await getPricingCalendarData(roomTypeId, year, month);

    if (result.error) {
      toast.error(result.error);
    } else {
      setPrices(result.prices);
      setBlockedDates(result.blockedDates);
    }

    setIsLoading(false);
  }, [roomTypeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshCalendar(displayMonth, true);
  }, [displayMonth, refreshCalendar]);

  const selectDay = (date: Date) => {
    const selected = getDateKey(date);

    if (!startDate || endDate) {
      setStartDate(selected);
      setEndDate("");
      return;
    }

    if (selected < startDate) {
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
      toast.error("Pilih tanggal mulai dan selesai di kalender.");
      return false;
    }
    return true;
  };

  const runMutation = (operation: () => Promise<{ error?: string; days_updated?: number; success?: boolean }>) => {
    startTransition(async () => {
      const result = await operation();
      if (result.error) {
        toast.error(result.error);
        return;
      }

      const daysText = result.days_updated ? ` (${result.days_updated} tanggal)` : "";
      toast.success(`Perubahan kalender berhasil disimpan${daysText}.`);
      await refreshCalendar(displayMonth, true);
    });
  };

  const handleBulkPrice = () => {
    if (!validateRange()) return;
    if (price < 0) {
      toast.error("Masukkan harga valid minimal Rp 0.");
      return;
    }

    runMutation(() => bulkUpsertPrices({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      price,
      apply_to: applyTo,
    }));
  };

  const handleBlockDates = () => {
    if (!validateRange()) return;

    runMutation(() => blockDates({
      room_type_id: roomTypeId,
      start_date: startDate,
      end_date: endDate,
      reason: blockReason || "Maintenance",
      apply_to: applyTo,
    }));
  };

  const handleUnblockDates = () => {
    if (!validateRange()) return;
    runMutation(() => unblockDates(roomTypeId, startDate, endDate));
  };

  const handleClearPrice = () => {
    if (!validateRange()) return;
    runMutation(() => clearPriceOverrides(roomTypeId, startDate, endDate));
  };

  const goToMonth = (date: Date) => {
    const nextMonth = startOfMonth(date);
    setDisplayMonth(nextMonth);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3A4A1F]">Rate Operations</p>
          <h3 className="mt-1 text-lg font-black text-slate-950">Harga & Availability</h3>
          <p className="mt-1 text-xs text-slate-500">Pilih tanggal di kalender, lalu apply harga atau block date.</p>
        </div>
        <button
          type="button"
          onClick={() => void refreshCalendar(displayMonth, false)}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-1.5">
        {[
          { label: "Semua", value: "all" },
          { label: "Weekday", value: "weekdays" },
          { label: "Weekend", value: "weekends" },
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

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="rounded-[24px] border border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToMonth(subMonths(displayMonth, 1))}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={selectFullMonth} className="text-sm font-black text-slate-900">
            {monthLabel}
          </button>
          <button
            type="button"
            onClick={() => goToMonth(addMonths(displayMonth, 1))}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">
          {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {calendarDays.map((date) => {
            const dateKey = getDateKey(date);
            const overridePrice = priceMap.get(dateKey);
            const blockedReason = blockedMap.get(dateKey);
            const inSelectedRange = startDate && endDate && dateKey >= startDate && dateKey <= endDate;
            const isRangeEdge = dateKey === startDate || dateKey === endDate;
            const isCurrentMonth = isSameMonth(date, displayMonth);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => selectDay(date)}
                className={cn(
                  "min-h-24 rounded-2xl border p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm",
                  isCurrentMonth ? "border-white bg-white" : "border-slate-50 bg-white/40 opacity-40",
                  overridePrice !== undefined && "border-emerald-200 bg-emerald-50",
                  blockedReason && "border-red-200 bg-red-50",
                  inSelectedRange && "ring-2 ring-[#3A4A1F]/40",
                  isRangeEdge && "ring-2 ring-[#3A4A1F]",
                  isToday(date) && "border-[#3A4A1F]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-black", isCurrentMonth ? "text-slate-700" : "text-slate-300")}>
                    {formatDate(date, "d")}
                  </span>
                  {blockedReason && <Ban className="h-3 w-3 text-red-500" />}
                </div>
                <div className="mt-2 space-y-1">
                  <p className={cn("truncate text-[9px] font-bold", overridePrice !== undefined ? "text-emerald-700" : "text-slate-400")}>
                    {overridePrice !== undefined ? formatIDR(overridePrice).replace("Rp", "").trim() : "Belum diatur"}
                  </p>
                  {overridePrice !== undefined && <p className="text-[8px] font-bold uppercase text-emerald-600">harga aktif</p>}
                  {blockedReason && <p className="line-clamp-2 text-[8px] font-bold text-red-600">{blockedReason}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm space-y-4">
        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Range Aktif</p>
          <p className="mt-2 text-sm font-black">
            {startDate && endDate ? `${startDate} - ${endDate}` : "Pilih tanggal"}
          </p>
          <p className="mt-1 text-xs text-white/60">{selectedDays || 0} tanggal dipilih</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Tanggal Mulai</label>
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-10 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500">Tanggal Selesai</label>
            <Input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-10 text-sm" />
          </div>
        </div>

        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("price")}
            className={cn("flex-1 rounded-lg py-2 text-xs font-bold", activeTab === "price" ? "bg-[#3A4A1F] text-white" : "text-slate-500")}
          >
            <TrendingUp className="mr-1 inline h-3.5 w-3.5" />
            Harga
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("block")}
            className={cn("flex-1 rounded-lg py-2 text-xs font-bold", activeTab === "block" ? "bg-red-500 text-white" : "text-slate-500")}
          >
            <Ban className="mr-1 inline h-3.5 w-3.5" />
            Availability
          </button>
        </div>

        {activeTab === "price" ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Harga per malam</label>
              <div className="relative">
                <Input
                  inputMode="numeric"
                  value={formatRupiahInput(price)}
                  onChange={(event) => setPrice(parseRupiahInput(event.target.value))}
                  className="h-12 rounded-2xl bg-slate-50 text-lg font-black text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Default harga adalah Rp 0 sampai admin menginput harga untuk tanggal tersebut.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRICE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPrice(preset)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-black text-slate-600 hover:border-[#3A4A1F]/30 hover:bg-[#3A4A1F]/5 hover:text-[#3A4A1F]"
                >
                  {formatRupiahInput(preset).replace("Rp ", "")}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={handleBulkPrice} disabled={isPending} className="h-10 rounded-xl bg-[#3A4A1F] text-xs font-bold text-white hover:bg-[#2A3A1F]">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarDays className="mr-2 h-4 w-4" />}
                Terapkan Harga
              </Button>
              <Button type="button" variant="outline" onClick={handleClearPrice} disabled={isPending} className="h-10 rounded-xl text-xs font-bold">
                Reset ke Rp 0
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Alasan block</label>
              <Input value={blockReason} onChange={(event) => setBlockReason(event.target.value)} className="h-10" placeholder="Maintenance, full booked, owner stay..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" onClick={handleBlockDates} disabled={isPending} className="h-10 rounded-xl bg-red-500 text-xs font-bold text-white hover:bg-red-600">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ban className="mr-2 h-4 w-4" />}
                Block Tanggal
              </Button>
              <Button type="button" variant="outline" onClick={handleUnblockDates} disabled={isPending} className="h-10 rounded-xl text-xs font-bold">
                Buka Block
              </Button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

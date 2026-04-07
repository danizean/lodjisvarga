"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Loader2, Ban, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { bulkUpsertPrices, blockDates } from "@/lib/actions/pricing";
import { format as formatDate } from "date-fns";
import { formatIDR } from "@/lib/utils/format";

interface PriceEntry {
  date: string;
  price: number;
}

interface BlockedEntry {
  date: string;
  reason?: string;
}

interface PricingCalendarProps {
  roomTypeId: string;
  basePrice: number;
  existingPrices?: PriceEntry[];
  blockedDates?: BlockedEntry[];
}

export function PricingCalendar({
  roomTypeId,
  basePrice,
  existingPrices = [],
  blockedDates: initialBlocked = [],
}: PricingCalendarProps) {
  const [tab, setTab] = useState<"price" | "block">("price");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState(basePrice.toString());
  const [blockReason, setBlockReason] = useState("Maintenance");
  const [isPending, startTransition] = useTransition();

  const priceMap = new Map(existingPrices.map(p => [p.date, p.price]));

  const handleBulkPrice = () => {
    if (!startDate || !endDate) { toast.error("Pilih rentang tanggal"); return; }
    if (!price || Number(price) < 1000) { toast.error("Masukkan harga yang valid (minimal Rp 1.000)"); return; }

    startTransition(async () => {
      const res = await bulkUpsertPrices({
        room_type_id: roomTypeId,
        start_date: startDate,
        end_date: endDate,
        price: Number(price),
      });

      if (res?.error) toast.error(res.error);
      else toast.success(`Harga ${formatIDR(Number(price))} berhasil diterapkan!`);
    });
  };

  const handleBlockDates = () => {
    if (!startDate || !endDate) { toast.error("Pilih rentang tanggal"); return; }

    startTransition(async () => {
      const res = await blockDates({
        room_type_id: roomTypeId,
        start_date: startDate,
        end_date: endDate,
        reason: blockReason,
      });

      if (res?.error) toast.error(res.error);
      else toast.success(`Tanggal berhasil diblokir (${blockReason})`);
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl border border-emerald-100 p-5 space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-100">
        <button
          type="button"
          onClick={() => setTab("price")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "price" ? "bg-[#3A4A1F] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> Harga Dinamis
        </button>
        <button
          type="button"
          onClick={() => setTab("block")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            tab === "block" ? "bg-red-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Ban className="w-3.5 h-3.5" /> Blokir Tanggal
        </button>
      </div>

      {/* Date Range Selector */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Mulai</label>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            min={formatDate(new Date(), "yyyy-MM-dd")}
            className="h-10 bg-white text-sm border-slate-200"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tanggal Selesai</label>
          <Input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={startDate || formatDate(new Date(), "yyyy-MM-dd")}
            className="h-10 bg-white text-sm border-slate-200"
          />
        </div>
      </div>

      {/* Tab-specific inputs */}
      {tab === "price" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Harga Spesial (IDR/malam)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
              <Input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                className="pl-9 h-10 font-mono font-bold bg-white border-slate-200"
                placeholder="0"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Harga dasar: {formatIDR(basePrice)} / malam
            </p>
          </div>
          <Button
            type="button"
            onClick={handleBulkPrice}
            disabled={isPending}
            className="w-full h-10 bg-[#3A4A1F] hover:bg-[#2A3A1F] text-sm font-bold rounded-xl"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarDays className="w-4 h-4 mr-2" />}
            Terapkan Harga
          </Button>
        </div>
      )}

      {tab === "block" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Alasan Pemblokiran</label>
            <Input
              value={blockReason}
              onChange={e => setBlockReason(e.target.value)}
              placeholder="Maintenance, Full Booking, dll..."
              className="h-10 bg-white border-slate-200 text-sm"
            />
          </div>
          <Button
            type="button"
            onClick={handleBlockDates}
            disabled={isPending}
            className="w-full h-10 bg-red-500 hover:bg-red-600 text-sm font-bold rounded-xl"
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
            Blokir Tanggal Ini
          </Button>
        </div>
      )}

      {/* Quick price overview */}
      {existingPrices.length > 0 && (
        <div className="border-t border-slate-200 pt-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Harga Tersimpan Bulan Ini
          </p>
          <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto">
            {existingPrices.slice(0, 12).map(p => (
              <div
                key={p.date}
                className={`text-center px-1 py-1 rounded-lg text-[9px] font-bold ${
                  p.price > basePrice ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}
              >
                {p.date.split("-")[2]}
                <div>{formatIDR(p.price).replace("Rp", "").trim()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

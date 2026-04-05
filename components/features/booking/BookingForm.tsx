// components/features/booking/BookingForm.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, WhatsappIcon } from "lucide-react";

export default function BookingForm({ villa }: { villa: any }) {
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>();

  const handleBooking = () => {
    if (!date?.from || !date?.to) return alert("Pilih tanggal dulu!");

    const start = format(date.from, "dd MMM yyyy");
    const end = format(date.to, "dd MMM yyyy");
    const message = `Halo, saya ingin reservasi di *${villa.name}*.\n\n📅 Check-in: ${start}\n📅 Check-out: ${end}\n\nApakah masih tersedia?`;

    window.open(
      `https://wa.me/${villa.whatsapp_number}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  return (
    <div className="border rounded-2xl p-6 shadow-sm sticky top-24 bg-white">
      <div className="mb-4">
        <span className="text-2xl font-bold">Start from IDR ...</span>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Pilih Tanggal</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    `${format(date.from, "LLL dd")} - ${format(date.to, "LLL dd")}`
                  ) : (
                    format(date.from, "LLL dd")
                  )
                ) : (
                  <span>Tentukan Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button
          onClick={handleBooking}
          className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
        >
          Hubungi via WhatsApp
        </Button>
      </div>
    </div>
  );
}

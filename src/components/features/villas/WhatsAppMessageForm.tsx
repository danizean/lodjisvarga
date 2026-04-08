"use client";

import type { FormEvent, ReactNode } from "react";
import { useId, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";
import { cn } from "@/lib/utils";

interface WhatsAppMessageFormProps {
  whatsappNumber?: string | null;
  villaName: string;
  roomTypeName?: string | null;
  roomTypeOptions?: string[];
  buttonLabel: string;
  buttonClassName?: string;
  title?: string;
  description?: string;
  contextLabel?: string;
  children?: ReactNode;
}

type ReservationForm = {
  fullName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  guestCount: string;
  notes: string;
};

type ReservationFormErrors = Partial<Record<keyof ReservationForm, string>>;

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

const countNights = (checkIn: string, checkOut: string) => {
  const start = new Date(`${checkIn}T00:00:00`).getTime();
  const end = new Date(`${checkOut}T00:00:00`).getTime();
  return Math.round((end - start) / 86400000);
};

export function WhatsAppMessageForm({
  whatsappNumber,
  villaName,
  roomTypeName,
  roomTypeOptions = [],
  buttonLabel,
  buttonClassName,
  title = "Form Reservasi Villa",
  description = "Lengkapi data reservasi. Pesan WhatsApp akan disusun rapi dari data yang Anda isi.",
  contextLabel = "Villa",
  children,
}: WhatsAppMessageFormProps) {
  const formId = useId();
  const initialRoomType = roomTypeName ?? roomTypeOptions[0] ?? "";
  const buildInitialForm = (): ReservationForm => ({
    fullName: "",
    checkIn: "",
    checkOut: "",
    roomType: initialRoomType,
    guestCount: "2",
    notes: "",
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ReservationForm>(buildInitialForm);
  const [errors, setErrors] = useState<ReservationFormErrors>({});
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const resetForm = () => {
    setForm(buildInitialForm());
    setErrors({});
    setGeneratedMessage("");
    setIsConfirming(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const updateField = (field: keyof ReservationForm, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const buildWhatsAppMessage = (cleanForm: ReservationForm) => {
    const nights = countNights(cleanForm.checkIn, cleanForm.checkOut);
    const notes = cleanForm.notes.trim();

    return (
      `Halo Lodjisvarga,\n\n` +
      `Saya ingin cek ketersediaan dan informasi reservasi villa berikut:\n\n` +
      `*Nama Lengkap:* ${cleanForm.fullName}\n` +
      `*${contextLabel}:* ${villaName}\n` +
      `*Tipe Kamar:* ${cleanForm.roomType}\n` +
      `*Tanggal Check-in:* ${formatDate(cleanForm.checkIn)}\n` +
      `*Tanggal Check-out:* ${formatDate(cleanForm.checkOut)}\n` +
      `*Durasi Menginap:* ${nights} malam\n` +
      `*Jumlah Tamu:* ${cleanForm.guestCount} orang\n` +
      (notes ? `*Catatan:* ${notes}\n` : "") +
      `\nMohon bantu konfirmasi ketersediaan kamar dan detail harganya. Terima kasih.`
    );
  };

  const validateForm = () => {
    const cleanForm: ReservationForm = {
      fullName: form.fullName.trim(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      roomType: form.roomType.trim(),
      guestCount: form.guestCount,
      notes: form.notes.trim(),
    };
    const nextErrors: ReservationFormErrors = {};
    const guestCount = Number(cleanForm.guestCount);

    if (cleanForm.fullName.length < 3) {
      nextErrors.fullName = "Nama lengkap minimal 3 karakter.";
    }
    if (!cleanForm.checkIn) {
      nextErrors.checkIn = "Tanggal check-in wajib diisi.";
    }
    if (!cleanForm.checkOut) {
      nextErrors.checkOut = "Tanggal check-out wajib diisi.";
    }
    if (cleanForm.checkIn && cleanForm.checkOut && cleanForm.checkOut <= cleanForm.checkIn) {
      nextErrors.checkOut = "Tanggal check-out harus setelah check-in.";
    }
    if (!cleanForm.roomType) {
      nextErrors.roomType = "Tipe kamar wajib diisi.";
    }
    if (!Number.isInteger(guestCount) || guestCount < 1) {
      nextErrors.guestCount = "Jumlah tamu minimal 1 orang.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setIsConfirming(false);
      return null;
    }

    return { ...cleanForm, guestCount: String(guestCount) };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanForm = validateForm();
    if (!cleanForm) return;

    setForm(cleanForm);
    setGeneratedMessage(buildWhatsAppMessage(cleanForm));
    setIsConfirming(true);
  };

  const handleSendToWhatsApp = () => {
    const cleanForm = validateForm();
    if (!cleanForm) return;

    const message = generatedMessage || buildWhatsAppMessage(cleanForm);

    window.open(
      generateWhatsAppLink(message, whatsappNumber ?? undefined),
      "_blank",
      "noopener,noreferrer"
    );
    handleOpenChange(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label={buttonLabel}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#128C7E]",
          buttonClassName
        )}
      >
        {children ?? buttonLabel}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-bold text-gray-900">
              {isConfirming ? "Konfirmasi Pesan WhatsApp" : title}
            </DialogTitle>
            <DialogDescription>
              {isConfirming
                ? "Pastikan isi pesan sudah sesuai sebelum dibuka di WhatsApp."
                : description}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">{contextLabel}:</span> {villaName}
            </p>
            {roomTypeName && (
              <p>
                <span className="font-semibold text-gray-900">Tipe kamar:</span> {roomTypeName}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Detail ini akan dipakai untuk menyusun pesan cek ketersediaan yang rapi.
            </p>
          </div>

          {!isConfirming ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor={`${formId}-full-name`} className="text-sm font-bold text-gray-800">
                    Nama Lengkap
                  </label>
                  <input
                    id={`${formId}-full-name`}
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    required
                    placeholder="Masukkan nama lengkap"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                  />
                  {errors.fullName && <p className="text-xs font-medium text-red-600">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-check-in`} className="text-sm font-bold text-gray-800">
                    Tanggal Check-in
                  </label>
                  <input
                    id={`${formId}-check-in`}
                    type="date"
                    value={form.checkIn}
                    onChange={(event) => updateField("checkIn", event.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                  />
                  {errors.checkIn && <p className="text-xs font-medium text-red-600">{errors.checkIn}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-check-out`} className="text-sm font-bold text-gray-800">
                    Tanggal Check-out
                  </label>
                  <input
                    id={`${formId}-check-out`}
                    type="date"
                    min={form.checkIn || undefined}
                    value={form.checkOut}
                    onChange={(event) => updateField("checkOut", event.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                  />
                  {errors.checkOut && <p className="text-xs font-medium text-red-600">{errors.checkOut}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-room-type`} className="text-sm font-bold text-gray-800">
                    Tipe Kamar
                  </label>
                  {roomTypeOptions.length > 0 ? (
                    <select
                      id={`${formId}-room-type`}
                      value={form.roomType}
                      onChange={(event) => updateField("roomType", event.target.value)}
                      required
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                    >
                      {roomTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`${formId}-room-type`}
                      value={form.roomType}
                      onChange={(event) => updateField("roomType", event.target.value)}
                      required
                      placeholder="Contoh: Private Room"
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                    />
                  )}
                  {errors.roomType && <p className="text-xs font-medium text-red-600">{errors.roomType}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor={`${formId}-guest-count`} className="text-sm font-bold text-gray-800">
                    Jumlah Tamu
                  </label>
                  <input
                    id={`${formId}-guest-count`}
                    type="number"
                    min={1}
                    value={form.guestCount}
                    onChange={(event) => updateField("guestCount", event.target.value)}
                    required
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                  />
                  {errors.guestCount && <p className="text-xs font-medium text-red-600">{errors.guestCount}</p>}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor={`${formId}-notes`} className="text-sm font-bold text-gray-800">
                    Catatan
                  </label>
                  <textarea
                    id={`${formId}-notes`}
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={4}
                    placeholder="Contoh: ingin cek ketersediaan, request extra bed, estimasi jam kedatangan, atau pertanyaan lain."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm leading-relaxed text-gray-800 outline-none transition focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#3A4A1F] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#2A3A1F]"
                >
                  Lanjut Konfirmasi
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-3 text-sm leading-relaxed text-gray-800">
                {generatedMessage}
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#128C7E]"
                >
                  Kirim ke WhatsApp
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

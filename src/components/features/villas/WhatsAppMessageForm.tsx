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

/* ------------------------------------------------------------------ */
/*  Reusable form field wrapper                                       */
/* ------------------------------------------------------------------ */

function FieldGroup({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-semibold text-gray-700 sm:text-sm"
      >
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-gray-400">{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared input class                                                */
/* ------------------------------------------------------------------ */

const inputClass =
  "h-11 sm:h-10 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20 disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

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

  const today = new Date().toISOString().split("T")[0];

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

  /* ------ Night count badge ------ */
  const nightCount =
    form.checkIn && form.checkOut && form.checkOut > form.checkIn
      ? countNights(form.checkIn, form.checkOut)
      : null;

  return (
    <>
      <button
        type="button"
        aria-label={buttonLabel}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-[#166534] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#14532D]",
          buttonClassName
        )}
      >
        {children ?? buttonLabel}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        {/* 
          Mobile: near-fullscreen sheet with scroll 
          Desktop: centered dialog max-w-lg
        */}
        <DialogContent
          className={cn(
            // Override base dialog sizing for this form
            "flex flex-col",
            // Mobile: almost full screen with safe-area padding
            "max-h-[calc(100dvh-2rem)] sm:max-h-[min(720px,90dvh)]",
            // Width: full on mobile, constrained on desktop
            "w-[calc(100%-1rem)] sm:w-full sm:max-w-lg",
            // Internal padding
            "gap-0 p-0"
          )}
        >
          {/* ── Header (fixed) ── */}
          <div className="shrink-0 border-b border-gray-100 px-5 pb-4 pt-5 sm:px-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-gray-900 sm:text-xl">
                {isConfirming ? "Konfirmasi Pesan WhatsApp" : title}
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-gray-500 sm:text-sm">
                {isConfirming
                  ? "Pastikan isi pesan sudah sesuai sebelum dibuka di WhatsApp."
                  : description}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* ── Scrollable body ── */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
            {/* Context badge */}
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 sm:p-3.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-gray-900">{villaName}</p>
                {roomTypeName && (
                  <p className="text-gray-600">{roomTypeName}</p>
                )}
              </div>
            </div>

            {!isConfirming ? (
              <form id={`${formId}-reservation`} onSubmit={handleSubmit} className="space-y-5">
                {/* ── Nama Lengkap ── */}
                <FieldGroup
                  label="Nama Lengkap"
                  htmlFor={`${formId}-full-name`}
                  error={errors.fullName}
                  required
                >
                  <input
                    id={`${formId}-full-name`}
                    value={form.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Masukkan nama lengkap Anda"
                    className={inputClass}
                  />
                </FieldGroup>

                {/* ── Tanggal Check-in & Check-out ── */}
                <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                  <FieldGroup
                    label="Check-in"
                    htmlFor={`${formId}-check-in`}
                    error={errors.checkIn}
                    required
                  >
                    <input
                      id={`${formId}-check-in`}
                      type="date"
                      min={today}
                      value={form.checkIn}
                      onChange={(event) => updateField("checkIn", event.target.value)}
                      required
                      className={inputClass}
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Check-out"
                    htmlFor={`${formId}-check-out`}
                    error={errors.checkOut}
                    required
                  >
                    <input
                      id={`${formId}-check-out`}
                      type="date"
                      min={form.checkIn || today}
                      value={form.checkOut}
                      onChange={(event) => updateField("checkOut", event.target.value)}
                      required
                      className={inputClass}
                    />
                  </FieldGroup>
                </div>

                {/* Night count indicator */}
                {nightCount !== null && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>
                      <span className="font-semibold">{nightCount} malam</span> menginap
                    </span>
                  </div>
                )}

                {/* ── Tipe Kamar & Jumlah Tamu ── */}
                <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                  <FieldGroup
                    label="Tipe Kamar"
                    htmlFor={`${formId}-room-type`}
                    error={errors.roomType}
                    required
                  >
                    {roomTypeOptions.length > 0 ? (
                      <select
                        id={`${formId}-room-type`}
                        value={form.roomType}
                        onChange={(event) => updateField("roomType", event.target.value)}
                        required
                        className={cn(inputClass, "appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9")}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
                        }}
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
                        className={inputClass}
                      />
                    )}
                  </FieldGroup>

                  <FieldGroup
                    label="Jumlah Tamu"
                    htmlFor={`${formId}-guest-count`}
                    error={errors.guestCount}
                    hint="Orang dewasa & anak"
                    required
                  >
                    <input
                      id={`${formId}-guest-count`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={50}
                      value={form.guestCount}
                      onChange={(event) => updateField("guestCount", event.target.value)}
                      required
                      className={inputClass}
                    />
                  </FieldGroup>
                </div>

                {/* ── Catatan ── */}
                <FieldGroup
                  label="Catatan Tambahan"
                  htmlFor={`${formId}-notes`}
                  hint="Opsional — request extra bed, estimasi kedatangan, dll."
                >
                  <textarea
                    id={`${formId}-notes`}
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={3}
                    placeholder="Tulis catatan di sini..."
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3.5 text-sm leading-relaxed text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-[#3A4A1F] focus:ring-2 focus:ring-[#3A4A1F]/20"
                  />
                </FieldGroup>
              </form>
            ) : (
              /* ── Confirmation view ── */
              <div className="space-y-4">
                <p className="text-[13px] font-medium text-gray-500">
                  Pesan yang akan dikirim:
                </p>
                <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-800 sm:max-h-72">
                  {generatedMessage}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer (sticky) ── */}
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-6">
            {!isConfirming ? (
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 sm:h-10 sm:w-auto"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form={`${formId}-reservation`}
                  className="h-11 w-full rounded-xl bg-[#3A4A1F] px-5 text-sm font-bold text-white transition-colors hover:bg-[#2A3A1F] active:bg-[#1f2b14] sm:h-10 sm:w-auto"
                >
                  Lanjut Konfirmasi
                </button>
              </div>
            ) : (
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 active:bg-gray-200 sm:h-10 sm:w-auto"
                >
                  Edit Data
                </button>
                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 text-sm font-bold text-white transition-colors hover:bg-[#14532D] active:bg-[#052E16] sm:h-10 sm:w-auto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.94 9.94 0 01-5.39-1.587l-.386-.238-2.65.889.889-2.65-.238-.386A9.94 9.94 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                  Kirim ke WhatsApp
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

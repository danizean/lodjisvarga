const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "6283144940611";

/**
 * Generates a WhatsApp click-to-chat link.
 */
export function generateWhatsAppLink(message: string, waNumber?: string): string {
  const number = waNumber ?? WA_NUMBER;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encoded}`;
}

/**
 * Generates a pre-filled WhatsApp booking message with full booking details.
 */
export function generateBookingWhatsAppMessage(params: {
  villaName: string;
  roomTypeName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice?: number;
}): string {
  const formatIDR = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const nights = Math.round(
    (params.checkOut.getTime() - params.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    `Halo Lodjisvarga, saya *${params.guestName}* ingin melakukan pemesanan:\n\n` +
    `🏡 *Properti:* ${params.villaName}\n` +
    `🛏️ *Tipe Kamar:* ${params.roomTypeName}\n` +
    `📅 *Check-in:* ${formatDate(params.checkIn)}\n` +
    `📅 *Check-out:* ${formatDate(params.checkOut)}\n` +
    `🌙 *Lama Menginap:* ${nights} malam\n` +
    `👥 *Jumlah Tamu:* ${params.guests} orang\n` +
    (params.totalPrice ? `💰 *Total Estimasi:* ${formatIDR(params.totalPrice)}\n` : "") +
    `\nMohon konfirmasi ketersediaan kamar. Terima kasih! 🙏`
  );
}

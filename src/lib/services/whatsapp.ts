const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890";

/**
 * Generates a WhatsApp click-to-chat link.
 * @param message - Pre-filled message text
 */
export function generateWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WA_NUMBER}?text=${encoded}`;
}

export function generateBookingWhatsAppMessage(params: {
  villaName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}): string {
  return (
    `Halo, saya *${params.guestName}* ingin booking villa:\n` +
    `🏡 *${params.villaName}*\n` +
    `📅 Check-in: ${params.checkIn.toLocaleDateString("id-ID")}\n` +
    `📅 Check-out: ${params.checkOut.toLocaleDateString("id-ID")}\n` +
    `👥 Tamu: ${params.guests} orang`
  );
}

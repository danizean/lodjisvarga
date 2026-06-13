import { WA_NUMBER } from "@/lib/constants/site";

export const DEFAULT_WHATSAPP_MESSAGE =
  "Halo Lodjisvarga, saya ingin cek ketersediaan kamar untuk menginap. Reff: Website";

export function buildWhatsAppUrl(message = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppFallbackPath(source = "website") {
  return `/contact?source=${encodeURIComponent(source)}`;
}

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/services/whatsapp";

interface WhatsAppButtonProps {
  message?: string;
}

export function WhatsAppButton({ message = "Halo, saya tertarik untuk booking villa." }: WhatsAppButtonProps) {
  const href = generateWhatsAppLink(message);
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-colors"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline font-medium">Chat us</span>
    </Link>
  );
}

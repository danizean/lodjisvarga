import { MessageCircle } from "lucide-react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";

interface WhatsAppButtonProps {
  label?: string;
}

export function WhatsAppButton({ label = "Chat us" }: WhatsAppButtonProps) {
  return (
    <WhatsAppMessageForm
      villaName="Lodjisvarga"
      buttonLabel={label}
      title="Chat Lodjisvarga"
      buttonClassName="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg transition-colors"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline font-medium">{label}</span>
    </WhatsAppMessageForm>
  );
}

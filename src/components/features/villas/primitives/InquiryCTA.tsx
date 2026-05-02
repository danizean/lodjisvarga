"use client";

import type { ReactNode } from "react";
import { WhatsAppMessageForm } from "@/components/features/villas/WhatsAppMessageForm";

interface InquiryCTAProps {
  isBookable: boolean;
  whatsappNumber?: string | null;
  villaName: string;
  roomTypeName: string;
  buttonLabel: string;
  title: string;
  buttonClassName: string;
  fallback: ReactNode;
  children?: ReactNode;
}

export function InquiryCTA({
  isBookable,
  whatsappNumber,
  villaName,
  roomTypeName,
  buttonLabel,
  title,
  buttonClassName,
  fallback,
  children,
}: InquiryCTAProps) {
  if (!isBookable || !whatsappNumber) {
    return <>{fallback}</>;
  }

  return (
    <WhatsAppMessageForm
      whatsappNumber={whatsappNumber}
      villaName={villaName}
      roomTypeName={roomTypeName}
      buttonLabel={buttonLabel}
      title={title}
      buttonClassName={buttonClassName}
    >
      {children ?? buttonLabel}
    </WhatsAppMessageForm>
  );
}


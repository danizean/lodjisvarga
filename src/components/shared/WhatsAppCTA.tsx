"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import {
  buildWhatsAppFallbackPath,
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
} from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics/gtm";

type WhatsAppCTAProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
> & {
  children: ReactNode;
  source?: string;
  message?: string;
};

export function WhatsAppCTA({
  children,
  source = "website",
  message = DEFAULT_WHATSAPP_MESSAGE,
  className,
  ...props
}: WhatsAppCTAProps) {
  const fallbackHref = buildWhatsAppFallbackPath(source);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const whatsappUrl = buildWhatsAppUrl(message);

    trackEvent("generate_lead", {
      method: "whatsapp",
      lead_source: source,
      page_path: window.location.pathname,
      page_location: window.location.href,
      link_url: whatsappUrl,
    });

    trackEvent("click_whatsapp", {
      source,
      page_path: window.location.pathname,
      page_location: window.location.href,
      link_url: whatsappUrl,
    });

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
}

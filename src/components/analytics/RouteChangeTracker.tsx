"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics/gtm";

export function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const queryString = searchParams.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    requestAnimationFrame(() => {
      trackEvent("virtual_page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
  }, [pathname, searchParams]);

  return null;
}

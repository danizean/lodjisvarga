"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/gtm";

type BlogEngagementTrackerProps = {
  slug: string;
  title: string;
};

export function BlogEngagementTracker({
  slug,
  title,
}: BlogEngagementTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    function handleScroll() {
      if (hasTracked.current) return;

      const scrollableHeight =
        document.body.scrollHeight - window.innerHeight;

      if (scrollableHeight <= 0) return;

      const scrollDepth = window.scrollY / scrollableHeight;

      if (scrollDepth >= 0.5) {
        hasTracked.current = true;

        trackEvent("blog_engagement", {
          blog_slug: slug,
          blog_title: title,
          scroll_depth: 50,
          page_path: window.location.pathname,
          page_location: window.location.href,
        });

        window.removeEventListener("scroll", handleScroll);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [slug, title]);

  return null;
}

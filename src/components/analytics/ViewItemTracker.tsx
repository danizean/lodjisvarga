"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/gtm";

type ViewItemTrackerProps = {
  itemId: string;
  itemName: string;
  itemCategory?: string;
  price?: number;
};

export function ViewItemTracker({
  itemId,
  itemName,
  itemCategory = "villa",
  price,
}: ViewItemTrackerProps) {
  useEffect(() => {
    trackEvent("view_item", {
      item_id: itemId,
      item_name: itemName,
      item_category: itemCategory,
      price,
      currency: "IDR",
      page_path: window.location.pathname,
      page_location: window.location.href,
    });
  }, [itemId, itemName, itemCategory, price]);

  return null;
}

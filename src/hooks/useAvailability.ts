"use client";

import { useEffect, useState } from "react";
import { getBlockedDates } from "@/lib/queries/availability";

export function useAvailability(roomTypeId: string) {
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomTypeId) return;
    setIsLoading(true);
    getBlockedDates(roomTypeId)
      .then(setBlockedDates)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [roomTypeId]);

  function isDateBlocked(date: Date): boolean {
    return blockedDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  }

  return { blockedDates, isDateBlocked, isLoading };
}

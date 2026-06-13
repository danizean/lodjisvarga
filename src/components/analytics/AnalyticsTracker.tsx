import { Suspense } from "react";
import { RouteChangeTracker } from "@/components/analytics/RouteChangeTracker";

export function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <RouteChangeTracker />
    </Suspense>
  );
}

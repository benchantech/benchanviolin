"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEventName, type AnalyticsParams } from "@/lib/analytics";

export function PageViewTracker({
  eventName,
  params,
}: {
  eventName: AnalyticsEventName;
  params?: AnalyticsParams;
}) {
  useEffect(() => {
    trackEvent(eventName, params);
  }, [eventName, params]);

  return null;
}

"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

// Sends one anonymous analytics event when a page is shown (for server pages)
export default function TrackView({ event, props }: { event: AnalyticsEvent; props: Record<string, string> }) {
  useEffect(() => {
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

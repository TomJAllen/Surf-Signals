"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { initAnalytics, setAnalyticsContext } from "@/lib/analytics";
import { setSignedIn } from "@/lib/recordDrill";

// Starts anonymous analytics and tags events with whether the visitor is signed in
// (true/false only, never who they are).
export default function AnalyticsProvider() {
  const { status } = useSession();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    setAnalyticsContext({ signed_in: status === "authenticated" });
    setSignedIn(status === "authenticated");
  }, [status]);

  return null;
}

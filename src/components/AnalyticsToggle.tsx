"use client";

import { useEffect, useState } from "react";
import { analyticsConfigured, isOptedOut, setAnalyticsOptOut } from "@/lib/analytics";

// Lets anyone switch anonymous usage analytics off (or back on) for this browser
export default function AnalyticsToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setEnabled(!isOptedOut());
  }, []);

  if (!analyticsConfigured() || enabled === null) return null;

  return (
    <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-primary"
        checked={enabled}
        onChange={(e) => {
          setEnabled(e.target.checked);
          setAnalyticsOptOut(!e.target.checked);
        }}
      />
      <span>
        <span className="font-semibold text-gray-900 block">Share anonymous usage data</span>
        <span className="text-sm text-gray-600">
          Helps improve the app (which pages and exercises are used, scores). Never includes your name, email
          or anything you type. Applies to this browser.
        </span>
      </span>
    </label>
  );
}

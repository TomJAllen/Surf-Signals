"use client";

import { useEffect, useState } from "react";
import { getLocalProgress } from "./localStorage";
import { recentBySignal } from "./progress";

// Each signal's latest results (newest first): from the account when signed in,
// otherwise from this browser. Used to build sessions that focus on weak signals.
export function useRecentSignalResults(authStatus: "loading" | "authenticated" | "unauthenticated") {
  const [recent, setRecent] = useState<Record<string, boolean[]>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authStatus === "loading") return;
    if (authStatus === "authenticated") {
      fetch("/api/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((s) => setRecent(s?.recentResults ?? {}))
        .catch(() => {})
        .finally(() => setReady(true));
    } else {
      const attempts = [...getLocalProgress().attempts].reverse();
      setRecent(recentBySignal(attempts));
      setReady(true);
    }
  }, [authStatus]);

  return { recent, ready };
}

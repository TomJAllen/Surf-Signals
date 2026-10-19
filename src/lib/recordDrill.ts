"use client";

import { track } from "./analytics";
import { SAVED_DRILLS, type SavedDrill } from "./drillResults";

// Called when any mnemonic or radio test is finished: sends the anonymous
// analytics event, and saves the result to the account if signed in.
let signedIn = false;
export function setSignedIn(value: boolean): void {
  signedIn = value;
}

export function recordDrillResult(r: { drill: string; item?: string | null; score: number; total: number; mistakes?: number }): void {
  const mistakes = r.mistakes ?? r.total - r.score;
  track("drill_completed", { drill: r.drill, item: r.item ?? null, score: r.score, total: r.total, mistakes });
  if (!signedIn || !SAVED_DRILLS.includes(r.drill as SavedDrill)) return;
  fetch("/api/drill-results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ drill: r.drill, item: r.item ?? null, score: r.score, total: r.total, mistakes }),
    keepalive: true,
  }).catch(() => {
    /* best effort: a lost result isn't worth interrupting the user for */
  });
}

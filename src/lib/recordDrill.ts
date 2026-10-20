"use client";

import { track } from "./analytics";
import { SAVED_DRILLS, type SavedDrill } from "./drillResults";
import { dailyKey } from "./daily";

interface Result {
  drill: string;
  item?: string | null;
  score: number;
  total: number;
  mistakes?: number;
}

let signedIn = false;
export function setSignedIn(value: boolean): void {
  signedIn = value;
}

// Called when an acronym or radio test, or today's practice, is finished: sends
// the anonymous analytics event and saves the result.
export function recordDrillResult(r: Result): void {
  const mistakes = r.mistakes ?? r.total - r.score;
  track("drill_completed", { drill: r.drill, item: r.item ?? null, score: r.score, total: r.total, mistakes });
  saveDrillResult({ ...r, mistakes });
}

// Saves a finished test or session to the account (if signed in), for the
// dashboard and History. Today's practice is also remembered in this browser so
// the dashboard shows it as done straight away.
export function saveDrillResult(r: Result): void {
  const mistakes = r.mistakes ?? r.total - r.score;
  if (r.drill === "daily_mix") rememberDaily(r.score, r.total);
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

// --- Today's practice, remembered in this browser ---

const DAILY_KEY = "ss-daily-last";

export interface DailyResult {
  day: string;
  score: number;
  total: number;
}

function rememberDaily(score: number, total: number) {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ day: dailyKey(), score, total }));
  } catch {
    /* storage unavailable */
  }
}

// Today's result from this browser, if today's practice was done here
export function dailyDoneHere(now = new Date()): DailyResult | null {
  try {
    const r = JSON.parse(localStorage.getItem(DAILY_KEY) ?? "null") as DailyResult | null;
    return r && r.day === dailyKey(now) ? r : null;
  } catch {
    return null;
  }
}

// Which of today's questions were right, for the "today's answers" list
const ANSWERS_KEY = "ss-daily-answers";

export function rememberDailyAnswers(results: boolean[]) {
  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify({ day: dailyKey(), results }));
  } catch {
    /* storage unavailable */
  }
}

export function dailyAnswersHere(now = new Date()): boolean[] | null {
  try {
    const r = JSON.parse(localStorage.getItem(ANSWERS_KEY) ?? "null") as { day: string; results: boolean[] } | null;
    return r && r.day === dailyKey(now) && Array.isArray(r.results) ? r.results : null;
  } catch {
    return null;
  }
}

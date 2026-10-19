// Turning practice history into goals: which signals are mastered, and the streak.

export type Mastery = "mastered" | "learning" | "new";

// How many recent tries in a row must be right for a signal to count as mastered
export const MASTERY_STREAK = 3;

// `recent` is the latest results for one signal, newest first
export function masteryOf(recent: boolean[]): Mastery {
  if (recent.length === 0) return "new";
  if (recent.length >= MASTERY_STREAK && recent.slice(0, MASTERY_STREAK).every(Boolean)) return "mastered";
  return "learning";
}

// Right answers in a row so far (newest first), capped at the mastery target
export function correctInARow(recent: boolean[]): number {
  let n = 0;
  for (const r of recent) {
    if (!r) break;
    n++;
  }
  return Math.min(n, MASTERY_STREAK);
}

// Latest results per signal, newest first, from attempts sorted newest first
export function recentBySignal(
  attempts: { signalId: string; correct: boolean }[],
  keep = MASTERY_STREAK
): Record<string, boolean[]> {
  const out: Record<string, boolean[]> = {};
  for (const a of attempts) {
    const list = (out[a.signalId] ??= []);
    if (list.length < keep) list.push(a.correct);
  }
  return out;
}

// "YYYY-MM-DD" in the viewer's own time zone
export function localDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Days in a row with some practice. Still counts if today hasn't been done yet
// (practising today keeps it going); broken if yesterday was missed too.
export function practiceStreak(times: (string | Date)[], now = new Date()): { days: number; doneToday: boolean } {
  const days = new Set(times.map((t) => localDay(new Date(t))));
  const today = localDay(now);
  const doneToday = days.has(today);
  const cursor = new Date(now);
  if (!doneToday) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDay(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { days: count, doneToday };
}

// --- Sessions and levels ---

// Signals in a quick session (the alternative is all of them)
export const QUICK_SESSION = 10;

// A session that leans on what you need: signals you're still learning first
// (fewest right in a row first), then ones you haven't tried, then mastered
// ones to keep them fresh. Returned in random order.
export function pickSessionSignals<T extends { id: string }>(
  signals: T[],
  recent: Record<string, boolean[]>,
  count: number,
  shuffleFn: <U>(a: U[]) => U[]
): T[] {
  if (count >= signals.length) return shuffleFn(signals);
  const learning = shuffleFn(signals.filter((s) => (recent[s.id]?.length ?? 0) > 0 && masteryOf(recent[s.id]) !== "mastered")).sort(
    (a, b) => correctInARow(recent[a.id]) - correctInARow(recent[b.id])
  );
  const fresh = shuffleFn(signals.filter((s) => !recent[s.id]?.length));
  const mastered = shuffleFn(signals.filter((s) => masteryOf(recent[s.id] ?? []) === "mastered"));
  return shuffleFn([...learning, ...fresh, ...mastered].slice(0, count));
}

export type Level = "not-started" | "learning" | "ready" | "patrol-ready";

export const LEVEL_LABEL: Record<Level, string> = {
  "not-started": "Not started",
  learning: "In training",
  ready: "Shadow patrolling",
  "patrol-ready": "Patrol-ready",
};

// How you're going in an area, in surf club terms: In training once you've
// started, Shadow patrolling from three quarters, Patrol-ready when everything is
// mastered or passed.
export function levelFor(done: number, total: number, tried: boolean): Level {
  if (total > 0 && done >= total) return "patrol-ready";
  if (total > 0 && done / total >= 0.75) return "ready";
  return tried || done > 0 ? "learning" : "not-started";
}

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

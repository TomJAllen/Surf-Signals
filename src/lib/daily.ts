// Today's practice is one set of questions a day, the same for everyone (like
// Wordle), so results can be compared. A new set starts at midnight Sydney time.

export const DAILY_TIME_ZONE = "Australia/Sydney";

// "2026-10-20": the day's key, in Sydney time
export function dailyKey(when: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(when);
}

// Small, fast pseudo-random generator from a text seed (mulberry32), so every
// browser builds the same set for the same day
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Runs `fn` with Math.random replaced by a seeded generator, so the existing
// question builders (which shuffle with Math.random) give the same result for
// the same seed. Synchronous only; Math.random is always put back.
export function withSeed<T>(seed: string, fn: () => T): T {
  const original = Math.random;
  Math.random = seededRandom(seed);
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

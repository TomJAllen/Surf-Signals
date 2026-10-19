import { describe, it, expect } from "vitest";
import { masteryOf, correctInARow, recentBySignal, practiceStreak } from "@/lib/progress";

describe("signal mastery", () => {
  it("needs the last 3 tries right", () => {
    expect(masteryOf([])).toBe("new");
    expect(masteryOf([true, true])).toBe("learning");
    expect(masteryOf([true, true, true])).toBe("mastered");
    expect(masteryOf([false, true, true])).toBe("learning");
    expect(masteryOf([true, true, true, false])).toBe("mastered");
  });

  it("counts right answers in a row, newest first", () => {
    expect(correctInARow([true, false, true])).toBe(1);
    expect(correctInARow([true, true, true, true])).toBe(3);
    expect(correctInARow([false])).toBe(0);
  });

  it("keeps the latest results per signal", () => {
    const r = recentBySignal([
      { signalId: "a", correct: true },
      { signalId: "b", correct: false },
      { signalId: "a", correct: false },
      { signalId: "a", correct: true },
      { signalId: "a", correct: true },
    ]);
    expect(r).toEqual({ a: [true, false, true], b: [false] });
  });
});

describe("practice streak", () => {
  const now = new Date(2026, 9, 19, 18, 0); // 19 Oct, local time
  const day = (d: number, h = 12) => new Date(2026, 9, d, h).toISOString();

  it("counts consecutive days including today", () => {
    expect(practiceStreak([day(19), day(18), day(17), day(15)], now)).toEqual({ days: 3, doneToday: true });
  });

  it("still counts if today isn't done yet", () => {
    expect(practiceStreak([day(18), day(17)], now)).toEqual({ days: 2, doneToday: false });
  });

  it("is broken by a missed day", () => {
    expect(practiceStreak([day(17), day(16)], now)).toEqual({ days: 0, doneToday: false });
    expect(practiceStreak([], now)).toEqual({ days: 0, doneToday: false });
  });
});

import { pickSessionSignals, levelFor } from "@/lib/progress";

describe("quick sessions and levels", () => {
  const ids = Array.from({ length: 14 }, (_, i) => ({ id: `s${i}` }));
  const same = <U,>(a: U[]) => [...a];

  it("puts weak signals first, then new, then mastered", () => {
    const recent: Record<string, boolean[]> = {
      s0: [true, true, true], // mastered
      s1: [false, true], // learning, 0 in a row
      s2: [true, false], // learning, 1 in a row
    };
    const picked = pickSessionSignals(ids, recent, 3, same).map((s) => s.id);
    expect(picked).toEqual(["s1", "s2", "s3"]);
    expect(pickSessionSignals(ids, recent, 14, same)).toHaveLength(14);
    expect(pickSessionSignals(ids, {}, 10, same)).toHaveLength(10);
  });

  it("gives one level per area", () => {
    expect(levelFor(0, 14, false)).toBe("not-started");
    expect(levelFor(0, 14, true)).toBe("learning");
    expect(levelFor(10, 14, true)).toBe("learning");
    expect(levelFor(11, 14, true)).toBe("ready");
    expect(levelFor(14, 14, true)).toBe("patrol-ready");
  });
});

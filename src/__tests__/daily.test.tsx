import { describe, it, expect } from "vitest";
import { dailyKey, seededRandom, withSeed } from "@/lib/daily";
import { dailyQuestions } from "@/lib/dailyQuestions";
import type { Signal } from "@/types";

const signals = Array.from({ length: 14 }, (_, i) => ({
  id: `sig${String(i).padStart(2, "0")}`,
  name: `Signal ${i}`,
  description: "d",
  imageUrl: "/x.png",
  category: "beach-to-water",
})) as unknown as Signal[];

const summary = (day: string, list = signals) =>
  dailyQuestions(list, day).map((q) => [q.id, q.options.join("|"), q.answer].join("~"));

describe("today's practice", () => {
  it("uses the Sydney date", () => {
    // 1pm UTC on 20 Oct is already 21 Oct in Sydney (UTC+11)
    expect(dailyKey(new Date("2026-10-20T13:30:00Z"))).toBe("2026-10-21");
    expect(dailyKey(new Date("2026-10-20T12:30:00Z"))).toBe("2026-10-20");
  });

  it("gives everyone the same set on the same day, in any order of signals", () => {
    expect(summary("2026-10-20")).toEqual(summary("2026-10-20", [...signals].reverse()));
    expect(summary("2026-10-20")).toHaveLength(4);
  });

  it("changes from day to day", () => {
    const days = ["2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23"].map((d) => summary(d).join());
    expect(new Set(days).size).toBeGreaterThan(1);
  });

  it("each question has its answer among the options", () => {
    for (const q of dailyQuestions(signals, "2026-11-02")) expect(q.options).toContain(q.answer);
  });

  it("puts Math.random back afterwards", () => {
    const before = Math.random;
    withSeed("x", () => Math.random());
    expect(Math.random).toBe(before);
    expect(seededRandom("a")()).toBe(seededRandom("a")());
  });
});

import { plainPrompt } from "@/lib/dailyQuestions";
describe("today's answers list", () => {
  it("shows each question's words", () => {
    for (const q of dailyQuestions(signals, "2026-10-20")) {
      const text = plainPrompt(q);
      expect(text).not.toBe("Question");
      expect(text.length).toBeGreaterThan(5);
    }
  });
});

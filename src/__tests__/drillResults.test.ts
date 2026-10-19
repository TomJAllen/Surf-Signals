import { describe, it, expect } from "vitest";
import { parseDrillResult, latestResults, mnemonicProgress, radioProgress, type LatestResult } from "@/lib/drillResults";

const r = (drill: string, item: string | null, score: number, total: number, mistakes = total - score): LatestResult => ({
  drill,
  item,
  score,
  total,
  mistakes,
  at: "2026-10-20T00:00:00Z",
});

describe("saving test results", () => {
  it("accepts a valid result", () => {
    expect(parseDrillResult({ drill: "mnemonic_quiz", item: "sample", score: 5, total: 6, mistakes: 1 })).toEqual({
      drill: "mnemonic_quiz",
      item: "sample",
      score: 5,
      total: 6,
      mistakes: 1,
    });
    expect(parseDrillResult({ drill: "radio_spell", item: null, score: 6, total: 6 })).not.toBeNull();
  });

  it("rejects anything odd", () => {
    for (const bad of [
      null,
      "x",
      { drill: "hack", score: 1, total: 1 },
      { drill: "radio_spell", score: 7, total: 6 },
      { drill: "radio_spell", score: 1, total: 0 },
      { drill: "radio_spell", score: 1.5, total: 2 },
      { drill: "radio_spell", score: -1, total: 2 },
      { drill: "mnemonic_quiz", item: "<script>", score: 1, total: 2 },
      { drill: "mnemonic_quiz", item: "x".repeat(41), score: 1, total: 2 },
    ]) {
      expect(parseDrillResult(bad)).toBeNull();
    }
  });

  it("keeps only the newest result per test and item", () => {
    const out = latestResults([r("mnemonic_quiz", "sample", 6, 6), r("mnemonic_quiz", "sample", 1, 6), r("mnemonic_quiz", "fast", 2, 4)]);
    expect(out.map((x) => `${x.item}:${x.score}`)).toEqual(["sample:6", "fast:2"]);
  });
});

describe("mastery for mnemonics and radio", () => {
  it("needs a perfect quiz and a clean match for a mnemonic", () => {
    const get = (latest: LatestResult[]) => mnemonicProgress(latest).find((m) => m.slug === "sample")!;
    expect(get([]).tried).toBe(false);
    expect(get([r("mnemonic_quiz", "sample", 6, 6)])).toMatchObject({ quizDone: true, mastered: false });
    expect(get([r("mnemonic_quiz", "sample", 6, 6), r("mnemonic_match", "sample", 6, 6, 1)]).mastered).toBe(false);
    expect(get([r("mnemonic_quiz", "sample", 6, 6), r("mnemonic_match", "sample", 6, 6, 0)]).mastered).toBe(true);
  });

  it("passes radio tests at 90% or a clean call", () => {
    const get = (latest: LatestResult[], id: string) => radioProgress(latest).find((x) => x.id === id)!;
    expect(get([r("radio_spell", null, 5, 6)], "spell").passed).toBe(false);
    expect(get([r("radio_prowords", null, 11, 12)], "prowords").passed).toBe(true);
    expect(get([r("radio_build_call", "radio-check", 6, 6, 2)], "calls")).toMatchObject({ tried: true, passed: false });
    expect(get([r("radio_build_call", "radio-check", 6, 6, 2), r("radio_build_call", "emergency", 7, 7, 0)], "calls").passed).toBe(true);
  });
});

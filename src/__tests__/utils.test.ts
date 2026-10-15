import { describe, it, expect } from "vitest";
import { shuffle } from "@/lib/shuffle";
import { normaliseEmail, clampLimit } from "@/lib/validation";

describe("shuffle", () => {
  it("keeps every item and doesn't mutate the input", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input);
    expect(out).toHaveLength(5);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });

  it("is roughly uniform (each item lands first ~1/n of the time)", () => {
    const counts = [0, 0, 0, 0];
    const runs = 8000;
    for (let i = 0; i < runs; i++) counts[shuffle([0, 1, 2, 3])[0]]++;
    for (const c of counts) expect(Math.abs(c / runs - 0.25)).toBeLessThan(0.03);
  });
});

describe("normaliseEmail", () => {
  it("trims and lowercases", () => {
    expect(normaliseEmail("  Tom@Example.COM ")).toBe("tom@example.com");
  });

  it("rejects invalid input", () => {
    expect(normaliseEmail("not-an-email")).toBeNull();
    expect(normaliseEmail("a@b")).toBeNull();
    expect(normaliseEmail(42)).toBeNull();
    expect(normaliseEmail(undefined)).toBeNull();
  });
});

describe("clampLimit", () => {
  it("uses the fallback for missing or invalid values", () => {
    expect(clampLimit(null, 20, 100)).toBe(20);
    expect(clampLimit("abc", 20, 100)).toBe(20);
    expect(clampLimit("-5", 20, 100)).toBe(20);
  });

  it("caps at the maximum", () => {
    expect(clampLimit("100000", 20, 100)).toBe(100);
    expect(clampLimit("7", 20, 100)).toBe(7);
  });
});

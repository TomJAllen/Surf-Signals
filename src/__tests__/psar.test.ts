import { describe, it, expect } from "vitest";
import { PSAR_QUESTIONS } from "@/content/psar";

describe("PSAR question bank", () => {
  it("has unique ids and four distinct options per question", () => {
    expect(new Set(PSAR_QUESTIONS.map((q) => q.id)).size).toBe(PSAR_QUESTIONS.length);
    for (const q of PSAR_QUESTIONS) {
      const options = [q.answer, ...q.wrong];
      expect(new Set(options).size, q.id).toBe(4);
      expect(q.question.endsWith("?"), q.id).toBe(true);
      expect(q.explain.length, q.id).toBeGreaterThan(10);
    }
  });
});

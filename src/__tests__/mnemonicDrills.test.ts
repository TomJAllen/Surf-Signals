import { describe, it, expect } from "vitest";
import { MNEMONICS } from "@/content/mnemonics";
import { sameLetterOptions, tooSimilar, matchCards, matchSource, parseMnemonicMode } from "@/lib/mnemonicQuiz";

describe("mnemonic quiz options", () => {
  it("gives three wrong answers for every letter, all starting with that letter", () => {
    for (const m of MNEMONICS) {
      m.items.forEach((item, i) => {
        for (let run = 0; run < 5; run++) {
          const opts = sameLetterOptions(m, i);
          expect(opts, `${m.slug} ${item.term}`).toHaveLength(3);
          for (const o of opts) {
            expect(o[0].toUpperCase()).toBe(item.letter.toUpperCase());
            expect(o).not.toBe(item.term);
            expect(tooSimilar(o, item.term), `${o} vs ${item.term}`).toBe(false);
          }
          expect(new Set(opts).size).toBe(3);
        }
      });
    }
  });

  it("treats near-identical terms as the same answer", () => {
    expect(tooSimilar("Medication", "Medications")).toBe(true);
    expect(tooSimilar("Injury or illness", "Illness and injury")).toBe(true);
    expect(tooSimilar("Signs", "Signs and symptoms")).toBe(true);
    expect(tooSimilar("Airway", "Allergies")).toBe(false);
  });
});

describe("matching board", () => {
  it("has exactly one statement per letter", () => {
    for (const m of MNEMONICS) {
      const cards = matchCards(m);
      expect(cards.map((c) => c.row).sort((a, b) => a - b)).toEqual(m.items.map((_, i) => i));
      cards.forEach((c) => expect(c.text.length).toBeGreaterThan(0));
    }
  });

  it("uses the scenario where there is one", () => {
    const sample = MNEMONICS.find((m) => m.slug === "sample")!;
    const texts = sample.sort!.facts.map((f) => f.text);
    matchCards(sample).forEach((c) => expect(texts).toContain(c.text));
  });

  it("falls back to ordering the words when letters have no description", () => {
    const help = MNEMONICS.find((m) => m.slug === "help")!;
    expect(matchSource(help)).toBe("term");
    expect(matchCards(help).map((c) => c.text).sort()).toEqual(help.items.map((i) => i.term).sort());
    expect(matchSource(MNEMONICS.find((m) => m.slug === "drsabcd")!)).toBe("detail");
  });

  it("keeps old order/sort links working", () => {
    expect(parseMnemonicMode("order")).toBe("match");
    expect(parseMnemonicMode("sort")).toBe("match");
    expect(parseMnemonicMode("quiz")).toBe("quiz");
    expect(parseMnemonicMode("nope")).toBeUndefined();
  });
});

import { PHONETIC, PHONETIC_DECOYS } from "@/content/radio";

describe("fair questions", () => {
  it("gives every phonetic letter at least 3 same-letter decoys, none of them right", () => {
    const official = new Set(["alpha", "alfa", "juliet", "juliett", "whiskey", "whisky", ...PHONETIC.map((p) => p.word.toLowerCase())]);
    for (const p of PHONETIC) {
      const decoys = PHONETIC_DECOYS[p.letter];
      expect(decoys?.length, p.letter).toBeGreaterThanOrEqual(3);
      for (const d of decoys) {
        expect(d[0].toUpperCase(), d).toBe(p.letter);
        expect(official.has(d.toLowerCase()), d).toBe(false);
      }
    }
  });

  it("never offers another part of an unordered set as a wrong answer", () => {
    for (const slug of ["four-ps", "four-s"]) {
      const m = MNEMONICS.find((x) => x.slug === slug)!;
      expect(m.unordered).toBe(true);
      const own = m.items.map((i) => i.term);
      m.items.forEach((_, i) => {
        for (let run = 0; run < 5; run++) {
          const opts = sameLetterOptions(m, i);
          expect(opts).toHaveLength(3);
          for (const o of opts) expect(own.some((t) => tooSimilar(t, o)), `${slug}: ${o}`).toBe(false);
        }
      });
    }
  });
});

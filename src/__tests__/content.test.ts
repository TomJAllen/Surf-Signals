import { describe, it, expect } from "vitest";
import { MNEMONICS, getMnemonic, MNEMONIC_GROUPS } from "@/content/mnemonics";
import { PHONETIC, PROWORDS, CALL_SCENARIOS, SPELLING_WORDS } from "@/content/radio";
import { checkSpelling, phoneticFor } from "@/components/drills/SpellDrill";

describe("mnemonics content", () => {
  it("has unique slugs and known groups", () => {
    const slugs = MNEMONICS.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const m of MNEMONICS) expect(MNEMONIC_GROUPS[m.group]).toBeDefined();
  });

  it("letters spell the mnemonic's name", () => {
    for (const m of MNEMONICS) {
      const lettersInName = m.name.replace(/^No /, "").replace(/[^A-Z]/g, "");
      if (/^\d/.test(m.name)) {
        // "4 Ps", "4 S's": n items all starting with that letter
        expect(m.items.length, m.name).toBe(Number(m.name[0]));
        continue;
      }
      expect(m.items.map((i) => i.letter).join(""), m.name).toBe(lettersInName);
    }
  });

  it("each term starts with its letter", () => {
    for (const m of MNEMONICS) {
      for (const it of m.items) expect(it.term[0].toUpperCase(), `${m.name}: ${it.term}`).toBe(it.letter);
    }
  });

  it("has unique terms within each mnemonic (needed for quiz answers)", () => {
    for (const m of MNEMONICS) {
      const terms = m.items.map((i) => i.term);
      expect(new Set(terms).size, m.name).toBe(terms.length);
    }
  });

  it("scenario facts point at real items and cover every item", () => {
    for (const m of MNEMONICS.filter((x) => x.sort)) {
      const used = new Set<number>();
      for (const f of m.sort!.facts) {
        expect(f.item, `${m.name}: ${f.text}`).toBeGreaterThanOrEqual(0);
        expect(f.item, `${m.name}: ${f.text}`).toBeLessThan(m.items.length);
        used.add(f.item);
      }
      expect(used.size, m.name).toBe(m.items.length);
    }
  });

  it("includes the handover mnemonics from the manual", () => {
    expect(getMnemonic("imist-ambo")?.items.map((i) => i.letter).join("")).toBe("IMISTAMBO");
    expect(getMnemonic("sample")?.items.map((i) => i.letter).join("")).toBe("SAMPLE");
    expect(getMnemonic("drsabcd")).toBeDefined();
  });
});

describe("radio content", () => {
  it("has the full phonetic alphabet in order", () => {
    expect(PHONETIC.map((p) => p.letter).join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  });

  it("has unique prowords and meanings", () => {
    expect(new Set(PROWORDS.map((p) => p.word)).size).toBe(PROWORDS.length);
    expect(new Set(PROWORDS.map((p) => p.meaning)).size).toBe(PROWORDS.length);
  });

  it("call scenarios have unique lines (the order drill relies on it)", () => {
    for (const s of CALL_SCENARIOS) {
      expect(new Set(s.lines.map((l) => l.text)).size, s.slug).toBe(s.lines.length);
    }
  });

  it("spelling words only use letters", () => {
    for (const w of SPELLING_WORDS) expect(w).toMatch(/^[A-Z]+$/);
  });
});

describe("phonetic spelling check", () => {
  it("spells a word", () => {
    expect(phoneticFor("IRB")).toEqual(["India", "Romeo", "Bravo"]);
  });

  it("accepts any case, commas and common alternative spellings", () => {
    expect(checkSpelling("IRB", "india romeo bravo")).toBe(true);
    expect(checkSpelling("IRB", "India, Romeo, Bravo")).toBe(true);
    expect(checkSpelling("AXJ", "Alfa Xray Juliett")).toBe(true);
  });

  it("rejects wrong, missing or extra words", () => {
    expect(checkSpelling("IRB", "India Romeo")).toBe(false);
    expect(checkSpelling("IRB", "India Romeo Bravo Bravo")).toBe(false);
    expect(checkSpelling("IRB", "Indigo Romeo Bravo")).toBe(false);
  });
});

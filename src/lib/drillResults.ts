// Mnemonic and radio test results: what can be saved, and what counts as
// mastered or passed. Shared by the save endpoint, the stats API and the dashboard.

import { MNEMONICS } from "@/content/mnemonics";
import { RADIO_DRILLS, type RadioDrill } from "@/content/radio";

export const SAVED_DRILLS = [
  "mnemonic_quiz",
  "mnemonic_match",
  "mnemonic_mixed",
  "radio_prowords",
  "radio_phonetic",
  "radio_spell",
  "radio_build_call",
  "daily_mix",
] as const;
export type SavedDrill = (typeof SAVED_DRILLS)[number];

export interface DrillResultInput {
  drill: SavedDrill;
  item: string | null;
  score: number;
  total: number;
  mistakes: number;
}

// Checks a result sent from the browser; returns null if anything is off
export function parseDrillResult(body: unknown): DrillResultInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!SAVED_DRILLS.includes(b.drill as SavedDrill)) return null;
  const int = (v: unknown, max: number) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max ? (v as number) : null);
  const total = int(b.total, 100);
  const score = int(b.score, 100);
  const mistakes = int(b.mistakes ?? 0, 500);
  if (total === null || total === 0 || score === null || score > total || mistakes === null) return null;
  const item = b.item == null ? null : typeof b.item === "string" && /^[a-z0-9-]{1,40}$/.test(b.item) ? b.item : undefined;
  if (item === undefined) return null;
  return { drill: b.drill as SavedDrill, item, score, total, mistakes };
}

export interface LatestResult {
  drill: string;
  item: string | null;
  score: number;
  total: number;
  mistakes: number;
  at: string;
}

// The newest result for each test (and mnemonic/scenario), from results sorted newest first
export function latestResults<T extends { drill: string; item: string | null }>(newestFirst: T[]): T[] {
  const seen = new Set<string>();
  return newestFirst.filter((r) => {
    const key = `${r.drill}|${r.item ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// --- Mnemonics: mastered = a perfect quiz AND a Match round with no mistakes ---

export interface MnemonicProgress {
  slug: string;
  name: string;
  quizDone: boolean;
  matchDone: boolean;
  tried: boolean;
  mastered: boolean;
}

export function mnemonicProgress(latest: LatestResult[]): MnemonicProgress[] {
  return MNEMONICS.map((m) => {
    const quiz = latest.find((r) => r.drill === "mnemonic_quiz" && r.item === m.slug);
    const match = latest.find((r) => r.drill === "mnemonic_match" && r.item === m.slug);
    const quizDone = !!quiz && quiz.score === quiz.total;
    const matchDone = !!match && match.mistakes === 0;
    return { slug: m.slug, name: m.name, quizDone, matchDone, tried: !!quiz || !!match, mastered: quizDone && matchDone };
  });
}

// --- Radio: passed = 90% or more on a quiz, or a call built with no mistakes ---

export const RADIO_PASS_MARK = 0.9;
const RADIO_DRILL_KEY: Record<RadioDrill, SavedDrill> = {
  prowords: "radio_prowords",
  phonetic: "radio_phonetic",
  spell: "radio_spell",
  calls: "radio_build_call",
};

export interface RadioProgress {
  id: RadioDrill;
  tried: boolean;
  passed: boolean;
}

export function radioProgress(latest: LatestResult[]): RadioProgress[] {
  return RADIO_DRILLS.map((id) => {
    const results = latest.filter((r) => r.drill === RADIO_DRILL_KEY[id]);
    const passed = results.some((r) =>
      id === "calls" ? r.mistakes === 0 : r.score / r.total >= RADIO_PASS_MARK
    );
    return { id, tried: results.length > 0, passed };
  });
}

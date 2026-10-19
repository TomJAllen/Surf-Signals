import { MNEMONICS, type Mnemonic } from "@/content/mnemonics";
import { shuffle } from "./shuffle";
import type { MatchCard } from "@/components/drills/MatchDrill";

// Wrong answers for "what does this letter stand for?" that all start with the same
// letter as the right answer, so the letter alone gives nothing away.
//
// Preference order:
// 1. other terms for the same letter in the same mnemonic (e.g. D: Danger vs Defibrillation)
// 2. real terms from mnemonics in the same group (Airway, Allergies, Arms…)
// 3. plausible first aid words, below (after the other groups, for patrol mnemonics)
// 4. terms from the other mnemonics
// Anything that means the same as the answer (Medication vs Medications,
// Injury or illness vs Illness and injury) is left out so there's only one right answer.

const EXTRA: Record<string, string[]> = {
  A: ["Assessment", "Ambulance", "Alertness", "Abdomen", "Aspiration"],
  B: ["Bleeding", "Bandage", "Blood pressure", "Burns", "Body position"],
  C: ["Circulation", "Consciousness", "Cooling", "Collapse", "Communication"],
  D: ["Diagnosis", "Dressing", "Duration", "Disability", "Drowning"],
  E: ["Exposure", "Examination", "Emergency services", "Evacuation"],
  F: ["Fluids", "Fractures", "First aid", "Flags"],
  H: ["Hydration", "Hazards", "Head injury", "Hypothermia"],
  I: ["Incident", "Immobilise", "Inspection", "Infection"],
  K: ["Knowledge", "Keep calm", "Kit check"],
  L: ["Location", "Level of consciousness", "Limbs", "Lifeguard"],
  M: ["Monitor", "Movement", "Mouth-to-mouth", "Medical kit"],
  N: ["Neutral", "Noted", "Neck", "Needed"],
  O: ["Observations", "Oxygen", "Onset", "Outcome"],
  P: ["Pulse", "Pain", "Patient", "Pressure", "Priority"],
  R: ["Recovery position", "Rescue", "Reassurance", "Radio"],
  S: ["Scene", "Shock", "Spinal", "Stabilise", "Safety", "Splint"],
  T: ["Temperature", "Transport", "Triage", "Tone"],
};

const STOP = new Set(["and", "or", "of", "the", "to", "a", "up", "not", "/"]);

// Significant words, roughly singular: "Medications" -> {"medication"}
function words(term: string): Set<string> {
  return new Set(
    term
      .toLowerCase()
      .replace(/[()]/g, " ")
      .split(/[\s/-]+/)
      .filter((w) => w && !STOP.has(w))
      .map((w) => w.replace(/(ies)$/, "y").replace(/(?<!s)s$/, ""))
  );
}

// True if two terms would both be reasonable answers
export function tooSimilar(a: string, b: string): boolean {
  const wa = words(a);
  const wb = words(b);
  if (!wa.size || !wb.size) return a.toLowerCase() === b.toLowerCase();
  const first = (w: Set<string>) => Array.from(w)[0];
  if (first(wa) === first(wb)) return true;
  const shared = Array.from(wa).filter((w) => wb.has(w)).length;
  return shared / Math.min(wa.size, wb.size) >= 0.5;
}

const startsWith = (term: string, letter: string) => term.trim().toUpperCase().startsWith(letter.toUpperCase());

export function sameLetterOptions(m: Mnemonic, index: number, count = 3): string[] {
  const { letter, term } = m.items[index];
  const chosen: string[] = [];
  const add = (candidates: string[]) => {
    for (const c of shuffle(candidates)) {
      if (chosen.length >= count) return;
      if (!startsWith(c, letter) || tooSimilar(c, term) || chosen.some((x) => tooSimilar(x, c))) continue;
      chosen.push(c);
    }
  };

  const termsOf = (list: Mnemonic[]) => list.flatMap((o) => o.items.map((x) => x.term));
  const others = MNEMONICS.filter((o) => o.slug !== m.slug);
  add(m.items.filter((_, j) => j !== index).map((x) => x.term));
  add(termsOf(others.filter((o) => o.group === m.group)));
  if (m.group !== "patrol") add(EXTRA[letter.toUpperCase()] ?? []);
  add(termsOf(others.filter((o) => o.group !== m.group)));
  add(EXTRA[letter.toUpperCase()] ?? []);
  return chosen;
}

export type MnemonicMode = "learn" | "quiz" | "match";

// Older links used ?mode=order and ?mode=sort; both now open the matching board
export function parseMnemonicMode(raw: string | undefined): MnemonicMode | undefined {
  if (raw === "order" || raw === "sort") return "match";
  return raw === "learn" || raw === "quiz" || raw === "match" ? raw : undefined;
}

// What goes on the matching board's cards, best first: lines from the scenario,
// each letter's description, or (when some letters have none, like HELP) the words
// themselves, which makes it an ordering exercise
export function matchSource(m: Mnemonic): "scenario" | "detail" | "term" {
  if (m.sort && m.items.every((_, i) => m.sort!.facts.some((f) => f.item === i))) return "scenario";
  return m.items.every((it) => it.detail.trim()) ? "detail" : "term";
}

// One card per letter; a different mix of scenario lines each round
export function matchCards(m: Mnemonic): MatchCard[] {
  const source = matchSource(m);
  return shuffle(
    m.items.map((it, i) => ({
      text:
        source === "scenario"
          ? shuffle(m.sort!.facts.filter((f) => f.item === i))[0].text
          : source === "detail"
            ? it.detail
            : it.term,
      row: i,
    }))
  );
}

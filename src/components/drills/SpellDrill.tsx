"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { recordDrillResult } from "@/lib/recordDrill";
import { shuffle } from "@/lib/shuffle";
import { PHONETIC, SPELLING_WORDS } from "@/content/radio";

const WORD_FOR: Record<string, string> = Object.fromEntries(PHONETIC.map((p) => [p.letter, p.word]));

// Common alternative spellings that should still count
const ALIASES: Record<string, string> = { alfa: "alpha", juliett: "juliet", xray: "x-ray", whisky: "whiskey" };

const normalise = (w: string) => {
  const lower = w.toLowerCase().replace(/[^a-z-]/g, "");
  return ALIASES[lower.replace(/-/g, "")] ?? ALIASES[lower] ?? lower;
};

export function phoneticFor(word: string): string[] {
  return word
    .toUpperCase()
    .split("")
    .filter((c) => WORD_FOR[c])
    .map((c) => WORD_FOR[c]);
}

// True if the typed answer spells the word in the phonetic alphabet
export function checkSpelling(word: string, typed: string): boolean {
  const expected = phoneticFor(word).map((w) => normalise(w));
  const given = typed
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(normalise);
  return given.length === expected.length && given.every((g, i) => g === expected[i]);
}

const ROUND = 6;

export default function SpellDrill() {
  const [words, setWords] = useState(() => shuffle(SPELLING_WORDS).slice(0, ROUND));
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const finished = index >= words.length;
  useEffect(() => {
    if (finished) recordDrillResult({ drill: "radio_spell", score, total: words.length });
    else if (index === 0) track("drill_started", { drill: "radio_spell", item: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, words]);

  if (finished) {
    return (
      <div className="card text-center space-y-4">
        <p className="text-4xl font-bold text-gray-900">
          {score} / {words.length}
        </p>
        <button
          className="btn-primary w-full"
          onClick={() => {
            setWords(shuffle(SPELLING_WORDS).slice(0, ROUND));
            setIndex(0);
            setTyped("");
            setResult(null);
            setScore(0);
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const word = words[index];

  const check = () => {
    const ok = checkSpelling(word, typed);
    setResult(ok);
    if (ok) setScore((s) => s + 1);
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Word {index + 1} of {words.length}
        </span>
        <span>Score {score}</span>
      </div>
      <p className="text-gray-700">Spell this using the phonetic alphabet:</p>
      <p className="text-4xl font-black tracking-widest text-gray-900 text-center">{word}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (result === null) check();
        }}
        className="space-y-3"
      >
        <label className="sr-only" htmlFor="spell">
          Your answer
        </label>
        <input
          id="spell"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          disabled={result !== null}
          placeholder="e.g. Bravo Oscar…"
          autoComplete="off"
          autoCapitalize="words"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {result === null && (
          <button type="submit" disabled={!typed.trim()} className="btn-primary w-full disabled:opacity-50">
            Check
          </button>
        )}
      </form>

      {result !== null && (
        <div className="space-y-3">
          <div
            className={`rounded-xl p-3 text-sm ${
              result ? "bg-green-50 border border-green-300 text-green-900" : "bg-red-50 border border-red-300 text-red-900"
            }`}
            role="status"
          >
            <p className="font-bold">{result ? "✓ Correct" : "✗ Not quite"}</p>
            <p>{phoneticFor(word).join(" · ")}</p>
          </div>
          <button
            autoFocus
            className="btn-primary w-full"
            onClick={() => {
              setIndex((i) => i + 1);
              setTyped("");
              setResult(null);
            }}
          >
            {index + 1 === words.length ? "See score" : "Next word"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { MNEMONICS, type Mnemonic } from "@/content/mnemonics";
import { shuffle } from "@/lib/shuffle";
import { sameLetterOptions, matchCards, matchSource, type MnemonicMode } from "@/lib/mnemonicQuiz";

export type { MnemonicMode };
import ChoiceDrill, { type ChoiceQuestion } from "./ChoiceDrill";
import MatchDrill from "./MatchDrill";
import Tabs from "./Tabs";

type Mode = MnemonicMode;

// The mnemonic's letters with one highlighted, e.g. IM[I]ST AMBO
function Letters({ m, highlight }: { m: Mnemonic; highlight?: number }) {
  return (
    <span className="inline-flex flex-wrap gap-1 font-black tracking-wide" aria-label={m.name}>
      {m.items.map((it, i) => (
        <span
          key={i}
          className={`w-9 h-10 flex items-center justify-center rounded-lg text-lg ${
            i === highlight ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {it.letter}
        </span>
      ))}
    </span>
  );
}

function quizQuestions(m: Mnemonic): ChoiceQuestion[] {
  return shuffle(m.items.map((item, i) => ({ item, i }))).map(({ item, i }) => {
    // Every option starts with the same letter, so the letter alone gives nothing away
    const distractors = sameLetterOptions(m, i);
    return {
      id: `${m.slug}-${i}`,
      prompt: (
        <div className="space-y-3">
          <Letters m={m} highlight={i} />
          <p>
            In {m.name}, what does letter {i + 1} ({item.letter}) stand for?
          </p>
        </div>
      ),
      options: shuffle([item.term, ...distractors]),
      answer: item.term,
      explain: item.detail ? (
        <>
          <strong>{item.term}:</strong> {item.detail}
        </>
      ) : undefined,
    };
  });
}

// A round of letter questions drawn from every mnemonic
export function mixedQuestions(count = 12): ChoiceQuestion[] {
  return shuffle(MNEMONICS.flatMap((m) => quizQuestions(m))).slice(0, count);
}

const MATCH_INTRO = {
  scenario: (m: Mnemonic) => m.sort!.intro,
  detail: (m: Mnemonic) => `Match each description to its letter in ${m.name}.`,
  term: (m: Mnemonic) => `Put the words of ${m.name} in order.`,
};

interface MnemonicTrainerProps {
  slug: string;
  modes?: Mode[]; // which tabs to offer (default: all)
  initialMode?: Mode;
  practiceHref?: string; // shown under Learn as the next step
}

export default function MnemonicTrainer({
  slug,
  modes = ["learn", "quiz", "match"],
  initialMode,
  practiceHref,
}: MnemonicTrainerProps) {
  const m = MNEMONICS.find((x) => x.slug === slug)!;
  const labels: Record<Mode, string> = { learn: "Learn", quiz: "Quiz", match: "Match" };
  const tabs = modes.map((id) => ({ id, label: labels[id] }));
  const [mode, setMode] = useState<Mode>(
    initialMode && tabs.some((t) => t.id === initialMode) ? initialMode : tabs[0].id
  );

  return (
    <div className="space-y-6">
      {tabs.length > 1 && <Tabs tabs={tabs} active={mode} onChange={setMode} />}

      {mode === "learn" && (
        <div className="space-y-3">
          <ol className="space-y-2">
            {m.items.map((it, i) => (
              <li key={i} className="card !p-4 flex gap-4 items-start">
                <span className="shrink-0 w-10 h-10 rounded-lg bg-primary text-white font-black text-xl flex items-center justify-center">
                  {it.letter}
                </span>
                <div>
                  <p className="font-bold text-gray-900">{it.term}</p>
                  {it.detail && <p className="text-gray-700 text-sm">{it.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
          {m.note && <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-xl p-3">{m.note}</p>}
          {practiceHref ? (
            <a href={practiceHref} className="btn-primary w-full block text-center">
              Practise {m.name}
            </a>
          ) : (
            modes.includes("quiz") && (
              <button onClick={() => setMode("quiz")} className="btn-primary w-full">
                Test yourself
              </button>
            )
          )}
        </div>
      )}

      {mode === "quiz" && <ChoiceDrill key="quiz" makeQuestions={() => quizQuestions(m)} doneLabel={`${m.name} quiz`} trackAs={{ drill: "mnemonic_quiz", item: m.slug }} />}

      {mode === "match" && (
        <MatchDrill
          key="match"
          rows={m.items.map((it) => ({ letter: it.letter, term: it.term }))}
          makeCards={() => matchCards(m)}
          intro={MATCH_INTRO[matchSource(m)](m)}
          trackAs={{ drill: "mnemonic_match", item: m.slug }}
        />
      )}
    </div>
  );
}

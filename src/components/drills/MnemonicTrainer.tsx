"use client";

import { useState } from "react";
import { MNEMONICS, type Mnemonic } from "@/content/mnemonics";
import { shuffle } from "@/lib/shuffle";
import ChoiceDrill, { type ChoiceQuestion } from "./ChoiceDrill";
import OrderDrill from "./OrderDrill";
import Tabs from "./Tabs";

export type MnemonicMode = "learn" | "quiz" | "order" | "sort";
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
  const others = MNEMONICS.filter((o) => o.slug !== m.slug).flatMap((o) => o.items.map((i) => i.term));
  return shuffle(m.items.map((item, i) => ({ item, i }))).map(({ item, i }) => {
    const sameSet = m.items.filter((_, j) => j !== i).map((x) => x.term);
    // Prefer the mnemonic's own other terms as distractors (harder), then fill from the rest
    const distractors = Array.from(new Set([...shuffle(sameSet), ...shuffle(others)]))
      .filter((t) => t !== item.term)
      .slice(0, 3);
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

const itemLabel = (m: Mnemonic, i: number) => `${m.items[i].letter} – ${m.items[i].term}`;

function sortQuestions(m: Mnemonic): ChoiceQuestion[] {
  if (!m.sort) return [];
  const options = m.items.map((_, i) => itemLabel(m, i));
  return shuffle(m.sort.facts).map((f, n) => ({
    id: `${m.slug}-sort-${n}`,
    prompt: (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Which part of {m.name} does this belong to?</p>
        <p className="text-xl">&ldquo;{f.text}&rdquo;</p>
      </div>
    ),
    options, // kept in mnemonic order: easier to scan
    answer: itemLabel(m, f.item),
    explain: m.items[f.item].detail ? (
      <>
        <strong>{m.items[f.item].term}:</strong> {m.items[f.item].detail}
      </>
    ) : undefined,
  }));
}

interface MnemonicTrainerProps {
  slug: string;
  modes?: Mode[]; // which tabs to offer (default: all)
  initialMode?: Mode;
  practiceHref?: string; // shown under Learn as the next step
}

export default function MnemonicTrainer({
  slug,
  modes = ["learn", "quiz", "order", "sort"],
  initialMode,
  practiceHref,
}: MnemonicTrainerProps) {
  const m = MNEMONICS.find((x) => x.slug === slug)!;
  const labels: Record<Mode, string> = { learn: "Learn", quiz: "Quiz", order: "Order", sort: "Sort a scenario" };
  const tabs = modes.filter((id) => id !== "sort" || m.sort).map((id) => ({ id, label: labels[id] }));
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

      {mode === "quiz" && <ChoiceDrill key="quiz" makeQuestions={() => quizQuestions(m)} doneLabel={`${m.name} quiz`} />}

      {mode === "order" && (
        <OrderDrill
          key="order"
          instructions={`Tap the parts of ${m.name} in order.`}
          items={m.items.map((it) => ({ label: it.term, tag: it.letter }))}
        />
      )}

      {mode === "sort" && m.sort && (
        <div className="space-y-3">
          <p className="text-gray-700">{m.sort.intro}</p>
          <ChoiceDrill key="sort" makeQuestions={() => sortQuestions(m)} doneLabel="Scenario sorted" />
        </div>
      )}
    </div>
  );
}

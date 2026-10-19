"use client";

import { useState } from "react";
import { MNEMONICS, type Mnemonic } from "@/content/mnemonics";
import { shuffle } from "@/lib/shuffle";
import ChoiceDrill, { type ChoiceQuestion } from "./ChoiceDrill";
import OrderDrill from "./OrderDrill";
import Tabs from "./Tabs";

type Mode = "learn" | "quiz" | "order" | "sort";

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

export default function MnemonicTrainer({ slug }: { slug: string }) {
  const m = MNEMONICS.find((x) => x.slug === slug)!;
  const [mode, setMode] = useState<Mode>("learn");

  const tabs: { id: Mode; label: string }[] = [
    { id: "learn", label: "Learn" },
    { id: "quiz", label: "Quiz" },
    { id: "order", label: "Order" },
    ...(m.sort ? [{ id: "sort" as Mode, label: "Sort a scenario" }] : []),
  ];

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} active={mode} onChange={setMode} />

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
          <button onClick={() => setMode("quiz")} className="btn-primary w-full">
            Test yourself
          </button>
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

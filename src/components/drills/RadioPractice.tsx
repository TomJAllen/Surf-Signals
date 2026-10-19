"use client";

import { useState } from "react";
import Link from "next/link";
import { CALL_SCENARIOS, PHONETIC, PROWORDS, RADIO_DRILLS, type RadioDrill } from "@/content/radio";
import { shuffle } from "@/lib/shuffle";
import ChoiceDrill, { type ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import OrderDrill from "@/components/drills/OrderDrill";
import SpellDrill from "@/components/drills/SpellDrill";
import Tabs from "@/components/drills/Tabs";
import Breadcrumbs from "@/components/Breadcrumbs";

type Mode = RadioDrill;

function prowordQuestions(): ChoiceQuestion[] {
  return shuffle(PROWORDS).map((p, i) => {
    const wrong = shuffle(PROWORDS.filter((x) => x.word !== p.word)).slice(0, 3);
    // Alternate between "what does it mean" and "which proword"
    return i % 2 === 0
      ? {
          id: `pw-${p.word}`,
          prompt: <>What does <strong>&ldquo;{p.word}&rdquo;</strong> mean?</>,
          options: shuffle([p.meaning, ...wrong.map((w) => w.meaning)]),
          answer: p.meaning,
        }
      : {
          id: `pw-${p.word}`,
          prompt: <>Which proword means: <em>&ldquo;{p.meaning}&rdquo;</em></>,
          options: shuffle([p.word, ...wrong.map((w) => w.word)]),
          answer: p.word,
        };
  });
}

function phoneticQuestions(): ChoiceQuestion[] {
  return shuffle(PHONETIC).slice(0, 12).map((p) => ({
    id: `ph-${p.letter}`,
    prompt: (
      <span className="flex items-center gap-3">
        <span className="text-5xl font-black text-primary">{p.letter}</span>
        <span>is…</span>
      </span>
    ),
    options: shuffle([p.word, ...shuffle(PHONETIC.filter((x) => x.letter !== p.letter)).slice(0, 3).map((x) => x.word)]),
    answer: p.word,
    explain: <>Say it &ldquo;{p.say}&rdquo;.</>,
  }));
}

export default function RadioPractice({ initialTab }: { initialTab?: string }) {
  const [mode, setMode] = useState<Mode>(
    RADIO_DRILLS.find((m) => m === initialTab) ?? "prowords"
  );
  const [scenario, setScenario] = useState(CALL_SCENARIOS[0].slug);
  const s = CALL_SCENARIOS.find((c) => c.slug === scenario)!;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }, { href: "/test/radio", label: "Radio" }]} />
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Test your radio</h1>
        <p className="text-gray-600">
          Need a refresher?{" "}
          <Link href="/learn/radio" className="text-primary font-semibold hover:underline">
            Learn radio
          </Link>
        </p>
      </header>

      <Tabs
        tabs={[
          { id: "prowords", label: "Prowords" },
          { id: "phonetic", label: "Phonetic letters" },
          { id: "spell", label: "Spell it" },
          { id: "calls", label: "Build the call" },
        ]}
        active={mode}
        onChange={(m) => {
          setMode(m);
          window.history.replaceState(null, "", `/test/radio/${m}`);
        }}
      />

      {mode === "prowords" && <ChoiceDrill key="pw" makeQuestions={prowordQuestions} doneLabel="Prowords" trackAs={{ drill: "radio_prowords" }} />}
      {mode === "phonetic" && <ChoiceDrill key="ph" makeQuestions={phoneticQuestions} doneLabel="Phonetic alphabet" trackAs={{ drill: "radio_phonetic" }} />}
      {mode === "spell" && <SpellDrill />}
      {mode === "calls" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CALL_SCENARIOS.map((c) => (
              <button
                key={c.slug}
                onClick={() => setScenario(c.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  scenario === c.slug ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
          <p className="text-gray-700 font-medium">{s.situation}</p>
          <OrderDrill
            key={s.slug}
            instructions="Put the radio exchange in the right order."
            trackAs={{ drill: "radio_build_call", item: s.slug }}
            items={s.lines.map((l) => ({ label: l.text, tag: l.from === "you" ? "You" : "Them" }))}
          />
        </div>
      )}
    </div>
  );
}

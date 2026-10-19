"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SignalImage from "@/components/SignalImage";
import ChoiceDrill, { type ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import { quizQuestions } from "@/components/drills/MnemonicTrainer";
import { phoneticQuestions, prowordQuestions } from "@/components/drills/RadioPractice";
import { MNEMONICS } from "@/content/mnemonics";
import { PSAR_QUESTIONS } from "@/content/psar";
import { pickSessionSignals } from "@/lib/progress";
import { mnemonicProgress, type LatestResult } from "@/lib/drillResults";
import { useRecentSignalResults } from "@/lib/useRecentSignalResults";
import { saveLocalAttempt } from "@/lib/localStorage";
import { track } from "@/lib/analytics";
import { shuffle } from "@/lib/shuffle";
import type { Signal } from "@/types";

const SEEN_KEY = "ss-psar-seen";

// The PSAR question you've gone longest without seeing (remembered in this browser)
function nextPsarQuestion(): ChoiceQuestion {
  let seen: string[] = [];
  try {
    seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
  } catch {
    /* storage unavailable */
  }
  const unseen = PSAR_QUESTIONS.filter((q) => !seen.includes(q.id));
  const q = shuffle(unseen.length ? unseen : PSAR_QUESTIONS)[0];
  try {
    const next = [...seen.filter((id) => id !== q.id), q.id].slice(-(PSAR_QUESTIONS.length - 1));
    localStorage.setItem(SEEN_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  return {
    id: `psar-${q.id}`,
    tag: `PSAR manual · ${q.topic}`,
    prompt: q.question,
    options: shuffle([q.answer, ...q.wrong]),
    answer: q.answer,
    explain: q.explain,
  };
}

function signalQuestion(signal: Signal, all: Signal[]): ChoiceQuestion {
  const others = shuffle(all.filter((s) => s.id !== signal.id)).slice(0, 3);
  return {
    id: `sig-${signal.id}`,
    tag: "Signals",
    prompt: (
      <div className="space-y-3">
        <p>What&apos;s this signal?</p>
        <SignalImage src={signal.imageUrl} alt="A lifesaver giving a signal" size="md" />
      </div>
    ),
    options: shuffle([signal.name, ...others.map((s) => s.name)]),
    answer: signal.name,
    explain: signal.description,
  };
}

// Today's practice: one signal, one mnemonic letter, one radio question and one
// question from the PSAR manual, focused on what you need where we know it.
export default function DailyPracticePage() {
  const { status } = useSession();
  const { recent, ready } = useRecentSignalResults(status);
  const [signals, setSignals] = useState<Signal[] | null>(null);
  const [drillResults, setDrillResults] = useState<LatestResult[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setSignals)
      .catch(() => setError("Couldn't load today's practice. Check your connection and try again."));
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      setDrillResults([]);
      return;
    }
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setDrillResults(s?.drillResults ?? []))
      .catch(() => setDrillResults([]));
  }, [status]);

  // A new set each time: on arrival, and again on "Try again"
  const canBuild = !!signals?.length && ready && drillResults !== null;
  const buildQuestions = useCallback((): ChoiceQuestion[] => {
    if (!signals?.length || drillResults === null) return [];
    const signal = pickSessionSignals(signals, recent, 1, shuffle)[0];
    const progress = mnemonicProgress(drillResults);
    const focus = progress.find((m) => m.tried && !m.mastered) ?? progress.find((m) => !m.mastered);
    const mnemonic = MNEMONICS.find((m) => m.slug === focus?.slug) ?? shuffle(MNEMONICS)[0];
    const mnemonicQ = { ...quizQuestions(mnemonic)[0], tag: `Acronyms · ${mnemonic.name}` };
    const radioQ = { ...shuffle([...prowordQuestions(), ...phoneticQuestions()])[0], tag: "Radio" };
    return [signalQuestion(signal, signals), mnemonicQ, radioQ, nextPsarQuestion()];
  }, [signals, recent, drillResults]);

  // The signal answer also counts towards that signal's mastery
  const onAnswer = (q: ChoiceQuestion, correct: boolean) => {
    if (!q.id.startsWith("sig-") || !signals) return;
    const signal = signals.find((s) => `sig-${s.id}` === q.id);
    if (!signal) return;
    track("signal_attempt", { mode: "identify", signal: signal.name, category: signal.category, correct });
    if (status !== "authenticated") {
      saveLocalAttempt({ signalId: signal.id, signalName: signal.name, mode: "identify", correct });
      return;
    }
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signalId: signal.id, mode: "identify", correct }),
    }).catch(() => {});
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: status === "authenticated" ? "/dashboard" : "/test", label: status === "authenticated" ? "Dashboard" : "Test" }]} />
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Today&apos;s practice</h1>
        <p className="text-stone-700">Four quick questions: a signal, an acronym, a radio call and one from the PSAR manual.</p>
      </header>

      {error ? (
        <div className="card text-center text-ink">{error}</div>
      ) : !canBuild ? (
        <div className="card flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <ChoiceDrill
          makeQuestions={buildQuestions}
          doneLabel="Today's practice"
          trackAs={{ drill: "daily_mix" }}
          onAnswer={onAnswer}
          doneExtra={
            <Link href={status === "authenticated" ? "/dashboard" : "/test"} className="btn-outline w-full">
              {status === "authenticated" ? "Back to dashboard" : "More tests"}
            </Link>
          }
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ChoiceDrill, { type ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import { type LatestResult } from "@/lib/drillResults";
import { dailyKey } from "@/lib/daily";
import { dailyQuestions, plainPrompt } from "@/lib/dailyQuestions";
import { dailyAnswersHere, dailyDoneHere, rememberDailyAnswers, type DailyResult } from "@/lib/recordDrill";
import { saveLocalAttempt } from "@/lib/localStorage";
import { track } from "@/lib/analytics";
import type { Signal } from "@/types";

// Today's practice: one set of four questions a day, the same for everyone,
// answered once. Afterwards you see your score and today's answers.
export default function DailyPracticePage() {
  const { status } = useSession();
  const [signals, setSignals] = useState<Signal[] | null>(null);
  const [error, setError] = useState("");
  const [day] = useState(() => dailyKey());
  // Already done today? From this browser, or from the account
  const [done, setDone] = useState<DailyResult | null | undefined>(undefined);
  const [results, setResults] = useState<boolean[] | null>(null);

  useEffect(() => {
    fetch("/api/signals")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setSignals)
      .catch(() => setError("Couldn't load today's practice. Check your connection and try again."));
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    const here = dailyDoneHere();
    setResults(dailyAnswersHere());
    if (here || status !== "authenticated") {
      setDone(here);
      return;
    }
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        const saved = (s?.drillResults as LatestResult[] | undefined)?.find(
          (r) => r.drill === "daily_mix" && dailyKey(new Date(r.at)) === day
        );
        setDone(saved ? { day, score: saved.score, total: saved.total } : null);
      })
      .catch(() => setDone(null));
  }, [status, day]);

  const questions = useMemo(() => (signals?.length ? dailyQuestions(signals, day) : []), [signals, day]);

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

  const backHref = status === "authenticated" ? "/dashboard" : "/test";
  const backLabel = status === "authenticated" ? "Dashboard" : "Test";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: backHref, label: backLabel }]} />
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Today&apos;s practice</h1>
        <p className="text-stone-700">
          Four questions a day, the same for everyone: a signal, an acronym, a radio call and one from the PSAR manual.
        </p>
      </header>

      {error ? (
        <div className="card text-center text-ink">{error}</div>
      ) : !signals || done === undefined ? (
        <div className="card flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : done ? (
        <div className="space-y-4">
          <section className="card space-y-2 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-correct">Done for today</p>
            <p className="font-display text-5xl font-extrabold text-ink">
              {done.score}/{done.total}
            </p>
            <p className="text-stone-700">A new set is ready at midnight. Keep practising with the tests in the meantime.</p>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              <Link href="/test" className="btn-primary">
                More tests
              </Link>
              {status === "authenticated" && (
                <Link href="/dashboard" className="btn-outline">
                  Back to dashboard
                </Link>
              )}
            </div>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-xl font-bold uppercase text-ink">Today&apos;s answers</h2>
            <ol className="card divide-y-2 divide-stone-200 p-0">
              {questions.map((q, i) => {
                const right = results?.[i];
                return (
                  <li key={q.id} className="flex items-start gap-3 px-4 py-3">
                    <span
                      aria-label={right === undefined ? undefined : right ? "You got this right" : "You got this wrong"}
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        right === undefined ? "bg-stone-200 text-stone-600" : right ? "bg-correct text-white" : "bg-primary text-white"
                      }`}
                    >
                      {right === undefined ? i + 1 : right ? "✓" : "✗"}
                    </span>
                    <div className="min-w-0">
                      {q.tag && <p className="text-xs font-bold uppercase tracking-widest text-primary">{q.tag}</p>}
                      <p className="text-ink">{plainPrompt(q)}</p>
                      <p className="font-semibold text-ink">{q.answer}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      ) : (
        <ChoiceDrill
          makeQuestions={() => questions}
          doneLabel="Today's practice"
          trackAs={{ drill: "daily_mix" }}
          onAnswer={onAnswer}
          allowRetry={false}
          onFinish={(score, total, res) => {
            rememberDailyAnswers(res);
            setResults(res);
            setDone({ day, score, total });
          }}
        />
      )}
    </div>
  );
}

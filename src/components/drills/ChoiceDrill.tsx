"use client";

import { useEffect, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { recordDrillResult } from "@/lib/recordDrill";

// Identifies a drill in analytics, e.g. { drill: "mnemonic_quiz", item: "sample" }
export interface DrillTracking {
  drill: string;
  item?: string;
}

export interface ChoiceQuestion {
  id: string;
  prompt: ReactNode;
  options: string[];
  answer: string;
  explain?: ReactNode;
  tag?: string; // small label above the question, e.g. "Signals" in a mixed set
}

interface ChoiceDrillProps {
  // Called on start and on "Try again", so questions and options are reshuffled each round
  makeQuestions: () => ChoiceQuestion[];
  doneLabel?: string;
  trackAs?: DrillTracking;
  onAnswer?: (question: ChoiceQuestion, correct: boolean) => void;
  doneExtra?: ReactNode; // shown under the score, e.g. a link back to the dashboard
}

// Multiple-choice drill: pick an answer, see why, then move on when ready.
export default function ChoiceDrill({ makeQuestions, doneLabel = "Round complete", trackAs, onAnswer, doneExtra }: ChoiceDrillProps) {
  const [questions, setQuestions] = useState<ChoiceQuestion[]>(() => makeQuestions());
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const done = index >= questions.length;
  const q = questions[index];
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (trackAs) track("drill_started", { ...trackAs, item: trackAs.item ?? null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    if (done && trackAs) {
      recordDrillResult({ drill: trackAs.drill, item: trackAs.item, score, total: questions.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const restart = () => {
    setQuestions(makeQuestions());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setRound((r) => r + 1);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="card text-center space-y-4">
        <p className="text-sm font-medium text-gray-500">{doneLabel}</p>
        <p className="text-4xl font-bold text-gray-900">
          {score} / {questions.length}
        </p>
        <p className="text-gray-600">
          {pct === 100 ? "Perfect. You know this one." : pct >= 70 ? "Nearly there. Go again to lock it in." : "Keep at it. Have another look at Learn, then try again."}
        </p>
        <button onClick={restart} className="btn-primary w-full">
          Try again
        </button>
        {doneExtra}
      </div>
    );
  }

  const optionClass = (option: string) => {
    const base = "w-full py-3 px-4 rounded-xl font-semibold text-left transition-all flex items-center justify-between gap-3";
    if (!picked) return `${base} bg-gray-100 hover:bg-gray-200 text-gray-900 active:scale-[0.98]`;
    if (option === q.answer) return `${base} bg-green-500 text-white`;
    if (option === picked) return `${base} bg-red-500 text-white`;
    return `${base} bg-gray-100 text-gray-400`;
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Question {index + 1} of {questions.length}
        </span>
        <span>Score {score}</span>
      </div>

      {q.tag && <p className="text-xs font-bold uppercase tracking-widest text-primary">{q.tag}</p>}
      <div className="text-lg font-semibold text-gray-900">{q.prompt}</div>

      <div className="space-y-2">
        {q.options.map((option) => (
          <button
            key={option}
            disabled={picked !== null}
            onClick={() => {
              setPicked(option);
              if (option === q.answer) setScore((s) => s + 1);
              onAnswer?.(q, option === q.answer);
            }}
            className={optionClass(option)}
          >
            <span>{option}</span>
            {picked && option === q.answer && <span className="text-sm whitespace-nowrap">✓ Correct</span>}
            {picked && option === picked && option !== q.answer && (
              <span className="text-sm whitespace-nowrap">✗ Your answer</span>
            )}
          </button>
        ))}
      </div>

      {picked && (
        <div className="space-y-3">
          {q.explain && (
            <div className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-xl p-3">{q.explain}</div>
          )}
          <button
            autoFocus
            onClick={() => {
              setIndex((i) => i + 1);
              setPicked(null);
            }}
            className="btn-primary w-full"
          >
            {index + 1 === questions.length ? "See score" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

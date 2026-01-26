"use client";

import Link from "next/link";
import type { StudyMode } from "@/types";

interface SessionResult {
  signalName: string;
  correct: boolean;
}

interface SessionSummaryProps {
  mode: StudyMode;
  results: SessionResult[];
  onRestart: () => void;
}

export default function SessionSummary({
  mode,
  results,
  onRestart,
}: SessionSummaryProps) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  const isIdentify = mode === "identify";

  // Determine performance level
  const getPerformanceLevel = () => {
    if (accuracy >= 90) return { label: "Excellent!", color: "text-success-dark", bg: "bg-success/10" };
    if (accuracy >= 70) return { label: "Good Job!", color: "text-secondary-dark", bg: "bg-secondary/10" };
    if (accuracy >= 50) return { label: "Keep Practicing", color: "text-accent-dark", bg: "bg-accent/10" };
    return { label: "Needs Work", color: "text-primary", bg: "bg-primary/10" };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${performance.bg}`}>
            {accuracy >= 70 ? (
              <svg className={`w-10 h-10 ${performance.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className={`w-10 h-10 ${performance.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${performance.color}`}>
            {performance.label}
          </h1>
          <p className="text-gray-600">
            Session Complete
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold text-gray-900">{total}</div>
            <div className="text-xs font-medium text-gray-500">Total</div>
          </div>
          <div className="text-center p-4 bg-success/10 rounded-xl">
            <div className="text-3xl font-bold text-success-dark">{correct}</div>
            <div className="text-xs font-medium text-gray-500">Correct</div>
          </div>
          <div className={`text-center p-4 rounded-xl ${performance.bg}`}>
            <div className={`text-3xl font-bold ${performance.color}`}>{accuracy}%</div>
            <div className="text-xs font-medium text-gray-500">Accuracy</div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Results Breakdown</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  result.correct ? "bg-success/10" : "bg-primary/10"
                }`}
              >
                <span className="font-medium text-gray-900 text-sm">
                  {result.signalName}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    result.correct
                      ? "bg-success/20 text-success-dark"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {result.correct ? "Correct" : "Incorrect"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className={`w-full py-4 px-6 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md ${
              isIdentify
                ? "bg-secondary text-gray-900 hover:bg-secondary-light"
                : "bg-accent text-white hover:bg-accent-dark"
            }`}
          >
            Practice Again
          </button>
          <Link
            href="/dashboard"
            className="block w-full py-4 px-6 rounded-xl font-bold text-center bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

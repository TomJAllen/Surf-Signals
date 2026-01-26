"use client";

import { useEffect, useState, useCallback } from "react";
import FlashCard from "@/components/FlashCard";
import SessionSetup from "@/components/SessionSetup";
import SessionSummary from "@/components/SessionSummary";
import type { Signal, SignalCategory, SessionConfig } from "@/types";

type SessionPhase = "setup" | "study" | "summary";

interface SessionResult {
  signalName: string;
  correct: boolean;
}

export default function IdentifyPage() {
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalSignals, setTotalSignals] = useState(0);
  const [signalsByCategory, setSignalsByCategory] = useState<Record<SignalCategory, number>>({
    water: 0,
    land: 0,
    irb: 0,
  });

  // Fetch all signals to get counts
  useEffect(() => {
    async function fetchSignals() {
      try {
        const response = await fetch("/api/signals");
        if (!response.ok) throw new Error("Failed to fetch signals");
        const data: Signal[] = await response.json();

        setTotalSignals(data.length);
        setSignalsByCategory({
          water: data.filter((s) => s.category === "water").length,
          land: data.filter((s) => s.category === "land").length,
          irb: data.filter((s) => s.category === "irb").length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  const startSession = useCallback(async (config: SessionConfig) => {
    setLoading(true);
    setError("");

    try {
      // Build query params
      const params = new URLSearchParams();
      if (config.category) params.set("category", config.category);
      params.set("limit", String(config.count));
      params.set("shuffle", "true");

      const response = await fetch(`/api/signals?${params}`);
      if (!response.ok) throw new Error("Failed to fetch signals");

      const data: Signal[] = await response.json();

      // Shuffle signals
      const shuffled = [...data].sort(() => Math.random() - 0.5);

      setSignals(shuffled.slice(0, config.count));
      setCurrentIndex(0);
      setResults([]);
      setPhase("study");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResult = async (correct: boolean) => {
    const signal = signals[currentIndex];
    if (!signal) return;

    setResults((prev) => [...prev, { signalName: signal.name, correct }]);

    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signalId: signal.id,
          mode: "identify",
          correct,
        }),
      });
    } catch (err) {
      console.error("Failed to record attempt:", err);
    }
  };

  const handleNext = () => {
    if (currentIndex < signals.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase("summary");
    }
  };

  const handleRestart = () => {
    setPhase("setup");
    setSignals([]);
    setCurrentIndex(0);
    setResults([]);
  };

  if (loading && phase === "setup") {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <div className="card max-w-md mx-auto">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Setup Phase
  if (phase === "setup") {
    return (
      <div className="space-y-6 pb-8">
        <SessionSetup
          mode="identify"
          totalSignals={totalSignals}
          signalsByCategory={signalsByCategory}
          onStart={startSession}
        />
      </div>
    );
  }

  // Summary Phase
  if (phase === "summary") {
    return (
      <div className="space-y-6 pb-8">
        <SessionSummary
          mode="identify"
          results={results}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  // Study Phase
  const currentSignal = signals[currentIndex];

  if (loading || !currentSignal) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg mb-4">
          <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-bold text-gray-900">Identify Mode</span>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-sm font-medium text-gray-500">
            Signal {currentIndex + 1} of {signals.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto px-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary transition-all duration-300"
              style={{ width: `${((currentIndex) / signals.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Session Stats */}
      {results.length > 0 && (
        <div className="flex justify-center gap-4 md:gap-8">
          <div className="text-center p-3 bg-secondary/10 rounded-xl min-w-[80px]">
            <div className="text-2xl font-bold text-gray-900">
              {results.length}
            </div>
            <div className="text-xs font-medium text-gray-500">Done</div>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-xl min-w-[80px]">
            <div className="text-2xl font-bold text-success-dark">
              {results.filter((r) => r.correct).length}
            </div>
            <div className="text-xs font-medium text-gray-500">Correct</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-xl min-w-[80px]">
            <div className="text-2xl font-bold text-accent-dark">
              {Math.round((results.filter((r) => r.correct).length / results.length) * 100)}%
            </div>
            <div className="text-xs font-medium text-gray-500">Accuracy</div>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <FlashCard
        signal={currentSignal}
        mode="identify"
        onResult={handleResult}
        onNext={handleNext}
      />
    </div>
  );
}

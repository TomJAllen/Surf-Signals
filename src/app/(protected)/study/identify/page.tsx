"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import MultipleChoiceCard from "@/components/MultipleChoiceCard";
import SessionSetup from "@/components/SessionSetup";
import { pickSessionSignals, QUICK_SESSION } from "@/lib/progress";
import { useRecentSignalResults } from "@/lib/useRecentSignalResults";
import { shuffle } from "@/lib/shuffle";
import SessionSummary from "@/components/SessionSummary";
import { useSession } from "next-auth/react";
import { saveLocalAttempt } from "@/lib/localStorage";
import { track } from "@/lib/analytics";
import type { Signal, SessionConfig } from "@/types";

type SessionPhase = "setup" | "study" | "summary";

interface SessionResult {
  signalName: string;
  correct: boolean;
}

export default function IdentifyPage() {
  const { status: authStatus } = useSession();
  // Latest results per signal, so a quick session can focus on weak ones
  const { recent, ready: recentReady } = useRecentSignalResults(authStatus);
  const recentRef = useRef(recent);
  recentRef.current = recent;
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allSignals, setAllSignals] = useState<Signal[]>([]);
  const [totalSignals, setTotalSignals] = useState(0);

  // Fetch all signals to get counts
  useEffect(() => {
    async function fetchSignals() {
      try {
        const response = await fetch("/api/signals");
        if (!response.ok) throw new Error("Failed to fetch signals");
        const data: Signal[] = await response.json();

        setAllSignals(data);
        setTotalSignals(data.length);
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
      const response = await fetch("/api/signals");
      if (!response.ok) throw new Error("Failed to fetch signals");
      const data: Signal[] = await response.json();

      // Weak signals first for a quick set; everything, shuffled, for a full one
      const shuffled = pickSessionSignals(data, recentRef.current, config.count, shuffle);

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

  // From the dashboard's "Start" button (?start=quick): skip the setup screen.
  // Waits for your results, so the set can focus on your weak signals.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || phase !== "setup" || totalSignals === 0 || !recentReady) return;
    if (new URLSearchParams(window.location.search).get("start") !== "quick") return;
    autoStarted.current = true;
    startSession({ mode: "identify", category: null, count: Math.min(QUICK_SESSION, totalSignals) });
  }, [phase, totalSignals, recentReady, startSession]);

  const handleResult = async (correct: boolean) => {
    const signal = signals[currentIndex];
    if (!signal) return;

    setResults((prev) => [...prev, { signalName: signal.name, correct }]);
    track("signal_attempt", { mode: "identify", signal: signal.name, category: signal.category, correct });

    // Guests: keep progress in this browser so it can be imported on sign-up/login
    if (authStatus !== "authenticated") {
      saveLocalAttempt({
        signalId: signal.id,
        signalName: signal.name,
        mode: "identify",
        correct,
      });
      return;
    }

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
    <div className="space-y-4 pb-8">
      {/* Compact Progress */}
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold text-ink whitespace-nowrap">
            Signal {currentIndex + 1} of {signals.length}
          </span>
          <div className="flex-1 h-3 bg-sand border-2 border-ink rounded-sm overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex) / signals.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Multiple Choice */}
      <MultipleChoiceCard
        signal={currentSignal}
        allSignals={allSignals}
        onResult={handleResult}
        onNext={handleNext}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import FlashCard from "@/components/FlashCard";
import SessionSetup from "@/components/SessionSetup";
import SessionSummary from "@/components/SessionSummary";
import type { Signal, SignalCategory, SessionConfig } from "@/types";

// LocalStorage key for camera preference
const CAMERA_ENABLED_KEY = "surf-signals-camera-enabled";

type SessionPhase = "setup" | "study" | "summary";

interface SessionResult {
  signalName: string;
  correct: boolean;
}

export default function PerformPage() {
  const [phase, setPhase] = useState<SessionPhase>("setup");
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalSignals, setTotalSignals] = useState(0);
  const [signalsByCategory, setSignalsByCategory] = useState<Record<SignalCategory, number>>({
    "beach-to-water": 0,
    "water-to-beach": 0,
  });
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  // Load camera preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CAMERA_ENABLED_KEY);
      if (saved !== null) {
        setCameraEnabled(saved === "true");
      }
    }
  }, []);

  // Save camera preference to localStorage
  const handleCameraToggle = useCallback((enabled: boolean) => {
    setCameraEnabled(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem(CAMERA_ENABLED_KEY, String(enabled));
    }
  }, []);

  // Fetch all signals to get counts
  useEffect(() => {
    async function fetchSignals() {
      try {
        const response = await fetch("/api/signals");
        if (!response.ok) throw new Error("Failed to fetch signals");
        const data: Signal[] = await response.json();

        setTotalSignals(data.length);
        setSignalsByCategory({
          "beach-to-water": data.filter((s) => s.category === "beach-to-water").length,
          "water-to-beach": data.filter((s) => s.category === "water-to-beach").length,
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

      // Request camera permission once at session start
      if (cameraEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          // Stop the test stream immediately - we just need the browser to grant permission
          stream.getTracks().forEach((track) => track.stop());
          setCameraPermissionGranted(true);
        } catch {
          // Permission denied or error - disable camera for this session
          setCameraPermissionGranted(false);
          setCameraEnabled(false);
        }
      }

      setSignals(shuffled.slice(0, config.count));
      setCurrentIndex(0);
      setResults([]);
      setPhase("study");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [cameraEnabled]);

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
          mode: "perform",
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          mode="perform"
          totalSignals={totalSignals}
          signalsByCategory={signalsByCategory}
          onStart={startSession}
          cameraEnabled={cameraEnabled}
          onCameraToggle={handleCameraToggle}
        />
      </div>
    );
  }

  // Summary Phase
  if (phase === "summary") {
    return (
      <div className="space-y-6 pb-8">
        <SessionSummary
          mode="perform"
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Compact Progress */}
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
            Signal {currentIndex + 1} of {signals.length}
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex) / signals.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <FlashCard
        signal={currentSignal}
        mode="perform"
        onResult={handleResult}
        onNext={handleNext}
        cameraEnabled={cameraEnabled}
        cameraPermissionGranted={cameraPermissionGranted}
      />
    </div>
  );
}

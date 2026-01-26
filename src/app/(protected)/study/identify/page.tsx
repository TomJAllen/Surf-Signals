"use client";

import { useEffect, useState, useCallback } from "react";
import FlashCard from "@/components/FlashCard";
import type { Signal } from "@/types";

export default function IdentifyPage() {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
  });

  const fetchRandomSignal = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/signals/random");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch signal");
      }
      const data = await response.json();
      setSignal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRandomSignal();
  }, [fetchRandomSignal]);

  const handleResult = async (correct: boolean) => {
    if (!signal) return;

    setSessionStats((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (correct ? 1 : 0),
    }));

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
    fetchRandomSignal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchRandomSignal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Identify Mode</h1>
        <p className="text-gray-600">
          Look at the signal image and try to identify it
        </p>
      </div>

      {/* Session Stats */}
      {sessionStats.total > 0 && (
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sessionStats.total}
            </div>
            <div className="text-sm text-gray-500">Attempted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sessionStats.correct}
            </div>
            <div className="text-sm text-gray-500">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
        </div>
      )}

      {/* Flashcard */}
      {signal && (
        <FlashCard
          signal={signal}
          mode="identify"
          onResult={handleResult}
          onNext={handleNext}
        />
      )}
    </div>
  );
}

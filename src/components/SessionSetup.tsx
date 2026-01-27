"use client";

import { useState } from "react";
import type { StudyMode, SignalCategory, SessionConfig } from "@/types";

interface SessionSetupProps {
  mode: StudyMode;
  totalSignals: number;
  signalsByCategory: Record<SignalCategory, number>;
  onStart: (config: SessionConfig) => void;
  cameraEnabled?: boolean;
  onCameraToggle?: (enabled: boolean) => void;
}

export default function SessionSetup({
  mode,
  totalSignals,
  signalsByCategory,
  onStart,
  cameraEnabled = false,
  onCameraToggle,
}: SessionSetupProps) {
  const [category, setCategory] = useState<SignalCategory | null>(null);
  const [count, setCount] = useState<number>(10);

  const isPerformMode = mode === "perform";

  const availableSignals = category
    ? signalsByCategory[category]
    : totalSignals;

  const countOptions = [5, 10, availableSignals].filter(
    (n, i, arr) => n <= availableSignals && arr.indexOf(n) === i
  );

  const handleStart = () => {
    onStart({
      mode,
      category,
      count: Math.min(count, availableSignals),
    });
  };

  const isIdentify = mode === "identify";

  return (
    <div className="max-w-md mx-auto px-4">
      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4 ${
            isIdentify ? "bg-secondary" : "bg-accent"
          }`}>
            {isIdentify ? (
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11" />
              </svg>
            )}
            <span className={`font-bold ${isIdentify ? "text-gray-900" : "text-white"}`}>
              {isIdentify ? "Identify Mode" : "Perform Mode"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Set Up Your Session
          </h1>
          <p className="text-gray-600">
            Choose how many signals you want to practice
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Signal Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`p-3 rounded-xl text-sm font-bold transition-all ${
                category === null
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All ({totalSignals})
            </button>
            <button
              onClick={() => setCategory("beach-to-water")}
              className={`p-3 rounded-xl text-sm font-bold transition-all ${
                category === "beach-to-water"
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Beach ({signalsByCategory["beach-to-water"]})
            </button>
            <button
              onClick={() => setCategory("water-to-beach")}
              className={`p-3 rounded-xl text-sm font-bold transition-all ${
                category === "water-to-beach"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Water ({signalsByCategory["water-to-beach"]})
            </button>
          </div>
        </div>

        {/* Count Selection */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Number of Signals
          </label>
          <div className="flex gap-2">
            {countOptions.map((option) => (
              <button
                key={option}
                onClick={() => setCount(option)}
                className={`flex-1 p-4 rounded-xl font-bold transition-all ${
                  count === option
                    ? "bg-secondary text-gray-900 shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option === availableSignals ? "All" : option}
                <span className="block text-xs font-medium opacity-70">
                  signals
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Camera Toggle (Perform Mode Only) */}
        {isPerformMode && onCameraToggle && (
          <div className="mb-8">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cameraEnabled ? "bg-accent/20" : "bg-gray-200"}`}>
                  <svg
                    className={`w-5 h-5 ${cameraEnabled ? "text-accent" : "text-gray-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Camera Detection</span>
                  <span className="text-xs text-gray-500">Auto-check your signal performance</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={cameraEnabled}
                  onChange={(e) => onCameraToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </div>
            </label>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={availableSignals === 0}
          className={`w-full py-4 px-6 rounded-xl font-bold transition-all active:scale-[0.98] shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
            isIdentify
              ? "bg-secondary text-gray-900 hover:bg-secondary-light"
              : "bg-accent text-white hover:bg-accent-dark"
          }`}
        >
          Start Session
        </button>

        {availableSignals === 0 && (
          <p className="text-center text-primary text-sm mt-4">
            No signals available in this category
          </p>
        )}
      </div>
    </div>
  );
}

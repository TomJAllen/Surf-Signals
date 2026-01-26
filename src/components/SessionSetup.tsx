"use client";

import { useState } from "react";
import type { StudyMode, SignalCategory, SessionConfig } from "@/types";

interface SessionSetupProps {
  mode: StudyMode;
  totalSignals: number;
  signalsByCategory: Record<SignalCategory, number>;
  onStart: (config: SessionConfig) => void;
}

export default function SessionSetup({
  mode,
  totalSignals,
  signalsByCategory,
  onStart,
}: SessionSetupProps) {
  const [category, setCategory] = useState<SignalCategory | null>(null);
  const [count, setCount] = useState<number>(10);

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
          <div className="grid grid-cols-2 gap-2">
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
              onClick={() => setCategory("water")}
              className={`p-3 rounded-xl text-sm font-bold transition-all ${
                category === "water"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Water ({signalsByCategory.water})
            </button>
            <button
              onClick={() => setCategory("land")}
              className={`p-3 rounded-xl text-sm font-bold transition-all ${
                category === "land"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Land ({signalsByCategory.land})
            </button>
            <button
              onClick={() => setCategory("irb")}
              className={`p-3 rounded-xl text-sm font-bold transition-all ${
                category === "irb"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              IRB ({signalsByCategory.irb})
            </button>
          </div>
        </div>

        {/* Count Selection */}
        <div className="mb-8">
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

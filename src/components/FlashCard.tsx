"use client";

import { useState } from "react";
import Image from "next/image";
import type { Signal, StudyMode } from "@/types";

interface FlashCardProps {
  signal: Signal;
  mode: StudyMode;
  onResult: (correct: boolean) => void;
  onNext: () => void;
}

export default function FlashCard({
  signal,
  mode,
  onResult,
  onNext,
}: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleAnswer = (correct: boolean) => {
    setAnswered(true);
    onResult(correct);
  };

  const handleNext = () => {
    setRevealed(false);
    setAnswered(false);
    onNext();
  };

  if (mode === "identify") {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Signal Image */}
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={signal.imageUrl}
              alt="Signal to identify"
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          {/* Card Content */}
          <div className="p-6">
            {!revealed ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  What signal is being shown?
                </p>
                <button
                  onClick={handleReveal}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Reveal Answer
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {signal.name}
                  </h2>
                  <p className="text-gray-600 mt-2">{signal.description}</p>
                </div>

                {!answered ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 py-3 px-6 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Incorrect
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 py-3 px-6 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Correct
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next Signal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Perform mode
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Prompt Section */}
        <div className="p-6 bg-blue-50">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {signal.name}
          </h2>
          <p className="text-gray-600 mt-2 text-center">{signal.description}</p>
        </div>

        {/* Image Section (hidden until revealed) */}
        {revealed && (
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={signal.imageUrl}
              alt={signal.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>
        )}

        {/* Card Content */}
        <div className="p-6">
          {!revealed ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Perform this signal, then reveal to check your form.
              </p>
              <button
                onClick={handleReveal}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Reveal Reference
              </button>
            </div>
          ) : (
            <div>
              {!answered ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnswer(false)}
                    className="flex-1 py-3 px-6 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Incorrect
                  </button>
                  <button
                    onClick={() => handleAnswer(true)}
                    className="flex-1 py-3 px-6 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    Correct
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next Signal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

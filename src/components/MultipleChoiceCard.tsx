"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import type { Signal } from "@/types";
import { shuffle } from "@/lib/shuffle";

interface MultipleChoiceCardProps {
  signal: Signal;
  allSignals: Signal[];
  onResult: (correct: boolean) => void;
  onNext: () => void;
}

function VideoEmbed({ url, title }: { url: string; title: string }) {
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        src={url}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default function MultipleChoiceCard({
  signal,
  allSignals,
  onResult,
  onNext,
}: MultipleChoiceCardProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);

  // Reset state when signal changes
  useEffect(() => {
    setSelectedId(null);
    setDisabled(false);
    setShowVideo(false);
  }, [signal.id]);

  // Generate 5 shuffled options: 1 correct + 4 random wrong
  const options = useMemo(() => {
    const wrong = shuffle(allSignals.filter((s) => s.id !== signal.id)).slice(0, 4);

    return shuffle([...wrong, signal]);
  }, [signal, allSignals]);

  const handleSelect = (option: Signal) => {
    if (disabled) return;
    setDisabled(true);
    setSelectedId(option.id);

    const correct = option.id === signal.id;
    onResult(correct);

    // Correct answers move on by themselves. Wrong ones wait on a Next button,
    // so there's time to read what the signal actually means.
    if (correct) {
      setTimeout(() => {
        onNext();
      }, 1500);
    }
  };

  const answeredWrong = selectedId !== null && selectedId !== signal.id;

  const getButtonClass = (option: Signal) => {
    const base =
      "w-full py-2.5 sm:py-3 px-4 rounded-xl font-bold text-left transition-all";

    if (!selectedId) {
      return `${base} bg-gray-100 hover:bg-gray-200 text-gray-900 active:scale-[0.98]`;
    }

    // After selection
    if (option.id === selectedId && option.id === signal.id) {
      // Selected the correct answer
      return `${base} bg-green-500 text-white`;
    }
    if (option.id === selectedId && option.id !== signal.id) {
      // Selected a wrong answer
      return `${base} bg-red-500 text-white`;
    }
    if (option.id === signal.id) {
      // Highlight the correct answer when wrong was selected
      return `${base} bg-yellow-400 text-gray-900`;
    }
    // Other unselected options
    return `${base} bg-gray-100 text-gray-400`;
  };

  const hasVideo = !!signal.videoUrl;

  const categoryColors: Record<string, string> = {
    "beach-to-water": "bg-amber-500",
    "water-to-beach": "bg-blue-500",
  };

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-4">
      <div className="flashcard">
        {/* Header */}
        <div className="flashcard-header text-center py-3">
          <span className="text-sm font-medium opacity-80">Identify Mode</span>
          <h3 className="text-lg font-bold">What signal is this?</h3>
        </div>

        {/* Media Toggle */}
        {hasVideo && (
          <div className="flex justify-center gap-2 p-2 bg-gray-100 border-b border-gray-200">
            <button
              onClick={() => setShowVideo(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                !showVideo
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Image
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                showVideo
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Video
            </button>
          </div>
        )}

        {/* Image beside the answers on wide screens, above them on phones */}
        <div className="md:grid md:grid-cols-2">
        {/* Signal Media: height capped to the viewport so the answers stay on screen */}
        <div className="relative w-full aspect-square max-h-[34svh] md:max-h-[62svh] bg-white">
          {signal.category && (
            <span
              className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white uppercase z-10 ${categoryColors[signal.category] || "bg-gray-500"}`}
            >
              {signal.category}
            </span>
          )}
          {showVideo && signal.videoUrl ? (
            <div className="absolute inset-4 flex items-center justify-center">
              <VideoEmbed url={signal.videoUrl} title={signal.name} />
            </div>
          ) : (
            <Image
              src={signal.imageUrl}
              alt="Identify this signal"
              fill
              sizes="(min-width: 768px) 448px, 100vw"
              className="object-contain p-4 md:p-6"
              priority
            />
          )}
        </div>

        {/* Answer Options */}
        <div className="p-4 bg-white space-y-2 md:flex md:flex-col md:justify-center md:space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={getButtonClass(option)}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{option.name}</span>
                {selectedId && option.id === signal.id && (
                  <span className="text-sm font-bold whitespace-nowrap">
                    ✓ {option.id === selectedId ? "Correct" : "Correct answer"}
                  </span>
                )}
                {selectedId && option.id === selectedId && option.id !== signal.id && (
                  <span className="text-sm font-bold whitespace-nowrap">✗ Your answer</span>
                )}
              </span>
            </button>
          ))}

          {answeredWrong && (
            <div className="mt-3 p-4 rounded-xl bg-yellow-50 border border-yellow-300 space-y-2" role="status">
              <p className="font-bold text-gray-900">This is: {signal.name}</p>
              <p className="text-sm text-gray-700">{signal.description}</p>
              <button
                onClick={onNext}
                autoFocus
                className="w-full mt-2 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98]"
              >
                Next signal
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

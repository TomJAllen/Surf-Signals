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
      "w-full py-2.5 sm:py-3 px-4 rounded-md border-2 border-ink font-semibold text-left transition-colors";

    if (!selectedId) {
      return `${base} bg-white hover:bg-secondary text-ink`;
    }
    if (option.id === selectedId && option.id === signal.id) {
      return `${base} bg-correct text-white`;
    }
    if (option.id === selectedId && option.id !== signal.id) {
      return `${base} bg-primary text-white`;
    }
    if (option.id === signal.id) {
      // Point out the right answer after a wrong pick
      return `${base} bg-secondary text-ink`;
    }
    return `${base} bg-white text-stone-400 border-stone-300`;
  };

  // Only offer the video once answered: the YouTube player shows the signal's name
  const hasVideo = !!signal.videoUrl && selectedId !== null;

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-4">
      <div className="flashcard">
        {/* Header */}
        <div className="flashcard-header flex flex-wrap items-center gap-x-3 gap-y-2 pr-20">
          <h3 className="text-2xl sm:text-3xl font-extrabold uppercase leading-none">What&apos;s this signal?</h3>
          {signal.category && (
            <span className={signal.category === "beach-to-water" ? "chip-beach" : "chip-water"}>
              {signal.category === "beach-to-water" ? "From the beach" : "From the water"}
            </span>
          )}
        </div>

        {/* Media Toggle */}
        {hasVideo && (
          <div className="flex justify-center gap-2 p-2 bg-sand border-b-2 border-ink">
            <button
              onClick={() => setShowVideo(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold border-2 ${
                !showVideo ? "bg-white border-ink text-ink" : "border-transparent text-stone-600 hover:text-ink"
              }`}
            >
              Image
            </button>
            <button
              onClick={() => setShowVideo(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold border-2 flex items-center gap-2 ${
                showVideo ? "bg-white border-ink text-ink" : "border-transparent text-stone-600 hover:text-ink"
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
        <div className="p-4 bg-white space-y-2 border-t-[3px] border-ink md:border-t-0 md:border-l-[3px] md:flex md:flex-col md:justify-center md:space-y-3">
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
            <div className="mt-3 p-4 rounded-md bg-sand border-2 border-ink space-y-2" role="status">
              <p className="font-display text-2xl font-bold uppercase leading-tight text-ink">{signal.name}</p>
              <p className="text-sm text-stone-700">{signal.description}</p>
              <button
                onClick={onNext}
                autoFocus
                className="btn-primary w-full mt-2"
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

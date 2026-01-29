"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import type { Signal } from "@/types";

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
    const wrong = allSignals
      .filter((s) => s.id !== signal.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    return [...wrong, signal].sort(() => Math.random() - 0.5);
  }, [signal, allSignals]);

  const handleSelect = (option: Signal) => {
    if (disabled) return;
    setDisabled(true);
    setSelectedId(option.id);

    const correct = option.id === signal.id;
    onResult(correct);

    const delay = correct ? 1500 : 3000;
    setTimeout(() => {
      onNext();
    }, delay);
  };

  const getButtonClass = (option: Signal) => {
    const base =
      "w-full py-3 px-4 rounded-xl font-bold text-left transition-all";

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
    <div className="max-w-lg mx-auto px-4">
      <div className="flashcard">
        {/* Header */}
        <div className="flashcard-header text-center">
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

        {/* Signal Media */}
        <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-gray-100">
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
              className="object-contain p-6"
              priority
            />
          )}
        </div>

        {/* Answer Options */}
        <div className="p-4 bg-white space-y-2">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option)}
              disabled={disabled}
              className={getButtonClass(option)}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

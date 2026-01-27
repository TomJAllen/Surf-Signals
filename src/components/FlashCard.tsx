"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { Signal, StudyMode } from "@/types";
import { CameraView } from "@/components/pose-detection";
import { isSignalDetectable } from "@/lib/pose/signalDefinitions";

interface FlashCardProps {
  signal: Signal;
  mode: StudyMode;
  onResult: (correct: boolean) => void;
  onNext: () => void;
  cameraEnabled?: boolean;
}

// YouTube Video Embed Component
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

// Perform mode phases: prompt → detecting → revealed → answered
type PerformPhase = "prompt" | "detecting" | "revealed" | "answered";

export default function FlashCard({
  signal,
  mode,
  onResult,
  onNext,
  cameraEnabled = false,
}: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [performPhase, setPerformPhase] = useState<PerformPhase>("prompt");
  const [cameraSkipped, setCameraSkipped] = useState(false);

  const isDetectable = isSignalDetectable(signal.name);
  const shouldShowCamera = mode === "perform" && cameraEnabled && isDetectable && !cameraSkipped;

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleAnswer = (correct: boolean) => {
    setAnswered(true);
    setPerformPhase("answered");
    onResult(correct);
  };

  const handleNext = () => {
    setRevealed(false);
    setAnswered(false);
    setShowVideo(false);
    setPerformPhase("prompt");
    setCameraSkipped(false);
    onNext();
  };

  // Camera detection handlers
  const handleStartDetection = useCallback(() => {
    setPerformPhase("detecting");
  }, []);

  const handleCameraMatch = useCallback(() => {
    // Auto-mark as correct when camera detects the signal
    setPerformPhase("revealed");
    setRevealed(true);
    setAnswered(true);
    onResult(true);
  }, [onResult]);

  const handleSkipCamera = useCallback(() => {
    // Skip camera and go to manual mode
    setCameraSkipped(true);
    setPerformPhase("revealed");
    setRevealed(true);
  }, []);

  const categoryColors: Record<string, string> = {
    water: "bg-blue-500",
    land: "bg-green-600",
    irb: "bg-orange-500",
  };

  const categoryBadge = signal.category && (
    <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white uppercase z-10 ${categoryColors[signal.category] || "bg-gray-500"}`}>
      {signal.category}
    </span>
  );

  // Media toggle for image/video
  const hasVideo = !!signal.videoUrl;

  const MediaToggle = () => hasVideo && (
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
          <path d="M8 5v14l11-7z"/>
        </svg>
        Video
      </button>
    </div>
  );

  const MediaDisplay = ({ showBadge = true }: { showBadge?: boolean }) => (
    <>
      <MediaToggle />
      <div className="relative aspect-square bg-gradient-to-b from-gray-50 to-gray-100">
        {showBadge && categoryBadge}
        {showVideo && signal.videoUrl ? (
          <div className="absolute inset-4 flex items-center justify-center">
            <VideoEmbed url={signal.videoUrl} title={signal.name} />
          </div>
        ) : (
          <Image
            src={signal.imageUrl}
            alt={signal.name}
            fill
            className="object-contain p-6"
            priority
          />
        )}
      </div>
    </>
  );

  if (mode === "identify") {
    return (
      <div className="max-w-lg mx-auto px-4">
        <div className="flashcard">
          {/* Header */}
          <div className="flashcard-header text-center">
            <span className="text-sm font-medium opacity-80">Identify Mode</span>
            <h3 className="text-lg font-bold">What signal is this?</h3>
          </div>

          {/* Signal Media (Image/Video) */}
          <MediaDisplay showBadge={true} />

          {/* Card Content */}
          <div className="p-6 bg-white">
            {!revealed ? (
              <div className="text-center">
                <p className="text-gray-500 mb-4 text-sm">
                  Think about what this signal means, then reveal the answer.
                </p>
                <button
                  onClick={handleReveal}
                  className="w-full py-4 px-6 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all active:scale-[0.98] shadow-md"
                >
                  Reveal Answer
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6 p-4 bg-gradient-to-b from-secondary/10 to-transparent rounded-xl">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {signal.name}
                  </h2>
                  <p className="text-gray-600 mt-2">{signal.description}</p>
                </div>

                {!answered ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 py-4 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98] shadow-md"
                    >
                      Incorrect
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 py-4 px-6 bg-success text-gray-900 rounded-xl font-bold hover:bg-success-light transition-all active:scale-[0.98] shadow-md"
                    >
                      Correct
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98] shadow-md"
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
    <div className="max-w-lg mx-auto px-4">
      <div className="flashcard">
        {/* Header with Signal Info */}
        <div className="flashcard-header">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium opacity-80">
              {performPhase === "detecting" ? "Camera Detection" : "Perform Mode"}
            </span>
            {signal.category && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                signal.category === "water" ? "bg-blue-400 text-blue-900" :
                signal.category === "land" ? "bg-green-400 text-green-900" :
                "bg-orange-400 text-orange-900"
              }`}>
                {signal.category}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {signal.name}
          </h2>
          <p className="opacity-80 mt-1">{signal.description}</p>
        </div>

        {/* Media Section (hidden until revealed, not shown during detection) */}
        {revealed && performPhase !== "detecting" && <MediaDisplay showBadge={false} />}

        {/* Card Content */}
        <div className="p-6 bg-white">
          {/* Prompt phase - show camera option or reveal button */}
          {performPhase === "prompt" && (
            <div className="text-center">
              {shouldShowCamera ? (
                <>
                  <div className="mb-6 p-6 bg-accent/10 rounded-xl border-2 border-dashed border-accent/30">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold text-accent">Camera Detection Available</span>
                    </div>
                    <p className="text-gray-700 text-sm">
                      Use your camera to automatically check if you&apos;re performing the signal correctly.
                    </p>
                  </div>
                  <button
                    onClick={handleStartDetection}
                    className="w-full py-4 px-6 bg-accent text-white rounded-xl font-bold hover:bg-accent-dark transition-all active:scale-[0.98] shadow-md mb-3"
                  >
                    Start Camera Detection
                  </button>
                  <button
                    onClick={handleSkipCamera}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-all"
                  >
                    Skip and self-assess instead
                  </button>
                </>
              ) : (
                <>
                  <div className="mb-6 p-6 bg-secondary/10 rounded-xl border-2 border-dashed border-secondary/30">
                    <p className="text-gray-700 font-medium">
                      Perform this signal physically, then reveal the reference to check your form.
                    </p>
                  </div>
                  <button
                    onClick={handleReveal}
                    className="w-full py-4 px-6 bg-accent text-white rounded-xl font-bold hover:bg-accent-dark transition-all active:scale-[0.98] shadow-md"
                  >
                    Reveal Reference
                  </button>
                </>
              )}
            </div>
          )}

          {/* Detecting phase - show camera view */}
          {performPhase === "detecting" && (
            <CameraView
              signalName={signal.name}
              onMatch={handleCameraMatch}
              onSkipCamera={handleSkipCamera}
              enabled={true}
            />
          )}

          {/* Revealed phase - show self-assessment or success */}
          {performPhase === "revealed" && !answered && (
            <div>
              <p className="text-center text-gray-600 mb-4 text-sm">
                Did you perform the signal correctly?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 py-4 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98] shadow-md"
                >
                  Incorrect
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 py-4 px-6 bg-success text-gray-900 rounded-xl font-bold hover:bg-success-light transition-all active:scale-[0.98] shadow-md"
                >
                  Correct
                </button>
              </div>
            </div>
          )}

          {/* Answered phase - show next button */}
          {answered && (
            <button
              onClick={handleNext}
              className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98] shadow-md"
            >
              Next Signal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

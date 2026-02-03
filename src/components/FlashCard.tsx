"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  cameraPermissionGranted?: boolean;
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

// Perform mode phases
type PerformPhase = "prompt" | "detecting" | "revealed" | "answered" | "timeout" | "success";

const TIMER_DURATION = 15;

export default function FlashCard({
  signal,
  mode,
  onResult,
  onNext,
  cameraEnabled = false,
  cameraPermissionGranted = false,
}: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [performPhase, setPerformPhase] = useState<PerformPhase>("prompt");
  const [cameraSkipped, setCameraSkipped] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isDetectable = isSignalDetectable(signal.name);

  // Show description only after performance (not during detecting phase)
  const showDescription = performPhase !== "prompt" && performPhase !== "detecting";

  // Auto-enter detecting phase when camera permission is granted
  useEffect(() => {
    if (mode === "perform" && cameraPermissionGranted && cameraEnabled && !cameraSkipped) {
      setPerformPhase("detecting");
      setTimeRemaining(TIMER_DURATION);
    }
  }, [signal.name, mode, cameraPermissionGranted, cameraEnabled, cameraSkipped]);

  // Timer countdown during detecting phase
  useEffect(() => {
    if (performPhase === "detecting") {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired
            if (timerRef.current) clearInterval(timerRef.current);
            setPerformPhase("timeout");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [performPhase]);

  // Auto-advance from timeout phase after 2 seconds
  useEffect(() => {
    if (performPhase === "timeout") {
      pauseTimerRef.current = setTimeout(() => {
        setRevealed(true);
        setAnswered(true);
        onResult(false);
        setPerformPhase("answered");
      }, 2000);

      return () => {
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      };
    }
  }, [performPhase, onResult]);

  // Auto-advance from success phase after 2 seconds
  useEffect(() => {
    if (performPhase === "success") {
      pauseTimerRef.current = setTimeout(() => {
        setPerformPhase("answered");
      }, 2000);

      return () => {
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      };
    }
  }, [performPhase]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const handleReveal = () => {
    setRevealed(true);
    setPerformPhase("revealed");
  };

  const handleAnswer = (correct: boolean) => {
    setAnswered(true);
    onResult(correct);
    if (correct) {
      setPerformPhase("success");
      setRevealed(true);
    } else {
      setPerformPhase("answered");
      setRevealed(true);
    }
  };

  const handleNext = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setRevealed(false);
    setAnswered(false);
    setShowVideo(false);
    setPerformPhase("prompt");
    setCameraSkipped(false);
    setTimeRemaining(TIMER_DURATION);
    onNext();
  };

  // Camera detection handlers
  const handleCameraMatch = useCallback(() => {
    // Stop timer
    if (timerRef.current) clearInterval(timerRef.current);
    // Show success pause
    setPerformPhase("success");
    setRevealed(true);
    setAnswered(true);
    onResult(true);
  }, [onResult]);

  const handleSkipCamera = useCallback(() => {
    // Stop timer and skip camera, go to manual mode
    if (timerRef.current) clearInterval(timerRef.current);
    setCameraSkipped(true);
    setPerformPhase("revealed");
    setRevealed(true);
  }, []);

  const categoryColors: Record<string, string> = {
    "beach-to-water": "bg-amber-500",
    "water-to-beach": "bg-blue-500",
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
                      className="flex-1 py-4 px-6 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all active:scale-[0.98] shadow-md"
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
              {performPhase === "detecting" ? "Camera Detection" :
               performPhase === "success" ? "Well Done!" :
               performPhase === "timeout" ? "Time's Up!" :
               "Perform Mode"}
            </span>
            {signal.category && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                signal.category === "beach-to-water" ? "bg-amber-400 text-amber-900" :
                "bg-blue-400 text-blue-900"
              }`}>
                {signal.category === "beach-to-water" ? "Beach" : "Water"}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold">
            {signal.name}
          </h2>
          {showDescription && (
            <p className="opacity-80 mt-1">{signal.description}</p>
          )}
        </div>

        {/* Success overlay */}
        {performPhase === "success" && (
          <div className="p-8 bg-green-50 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-green-700">Correct!</h3>
            <p className="text-green-600 text-sm mt-1">Well done!</p>
          </div>
        )}

        {/* Timeout overlay */}
        {performPhase === "timeout" && (
          <div className="p-8 bg-red-50 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-700">Time&apos;s Up!</h3>
            <p className="text-red-600 text-sm mt-1">The correct signal is shown below</p>
          </div>
        )}

        {/* Media Section - shown for success, timeout, revealed, answered */}
        {revealed && performPhase !== "detecting" && <MediaDisplay showBadge={false} />}

        {/* Card Content */}
        <div className="p-6 bg-white">
          {/* Prompt phase - no camera, show reveal button */}
          {performPhase === "prompt" && (
            <div className="text-center">
              <div className="mb-6 p-6 bg-secondary/10 rounded-xl border-2 border-dashed border-secondary/30">
                <p className="text-gray-700 font-medium">
                  Perform this signal physically, then reveal the reference to check your form.
                </p>
              </div>
              <button
                onClick={handleReveal}
                className="w-full py-4 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98] shadow-md"
              >
                Reveal Reference
              </button>
            </div>
          )}

          {/* Detecting phase - show camera view */}
          {performPhase === "detecting" && (
            <CameraView
              signalName={signal.name}
              onMatch={handleCameraMatch}
              onSkipCamera={handleSkipCamera}
              enabled={true}
              cameraPermissionGranted={cameraPermissionGranted}
              timeRemaining={timeRemaining}
              isDetectable={isDetectable}
              onSelfAssess={handleAnswer}
            />
          )}

          {/* Revealed phase - show self-assessment */}
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
                  className="flex-1 py-4 px-6 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all active:scale-[0.98] shadow-md"
                >
                  Correct
                </button>
              </div>
            </div>
          )}

          {/* Answered phase - show next button */}
          {performPhase === "answered" && (
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

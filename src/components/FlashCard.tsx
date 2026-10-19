"use client";

import { track } from "@/lib/analytics";
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

  const categoryBadge = signal.category && (
    <span className={`absolute top-3 left-3 z-10 ${signal.category === "beach-to-water" ? "chip-beach" : "chip-water"}`}>
      {signal.category === "beach-to-water" ? "From the beach" : "From the water"}
    </span>
  );

  // Media toggle for image/video
  const hasVideo = !!signal.videoUrl;

  const MediaToggle = () => hasVideo && (
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
        onClick={() => {
              setShowVideo(true);
              track("video_opened", { signal: signal.name, where: "perform" });
            }}
        className={`px-4 py-1.5 rounded-md text-sm font-bold border-2 flex items-center gap-2 ${
          showVideo ? "bg-white border-ink text-ink" : "border-transparent text-stone-600 hover:text-ink"
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
      {/* Height capped to the viewport so the buttons below stay on screen */}
      <div className="relative w-full aspect-square max-h-[34svh] md:max-h-[45svh] bg-white border-b-[3px] border-ink">
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
            sizes="(min-width: 768px) 512px, 100vw"
            className="object-contain p-4 md:p-6"
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
          <div className="flashcard-header">
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase leading-none">What&apos;s this signal?</h3>
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
                  className="btn-secondary w-full"
                >
                  Reveal Answer
                </button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6 p-4 bg-sand rounded-md border-2 border-ink">
                  <h2 className="text-3xl font-extrabold uppercase leading-none text-ink">
                    {signal.name}
                  </h2>
                  <p className="text-gray-600 mt-2">{signal.description}</p>
                </div>

                {!answered ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="btn-outline flex-1 px-3"
                    >
                      Incorrect
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="btn-secondary flex-1 px-3"
                    >
                      Correct
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleNext}
                    className="btn-primary w-full"
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
          <div className="flex items-center justify-between gap-3 mb-2 pr-14">
            <span className="relative z-10 text-sm font-semibold text-white/90">
              {performPhase === "detecting" ? "Camera Detection" :
               performPhase === "success" ? "Well Done!" :
               performPhase === "timeout" ? "Time's Up!" :
               "Perform Mode"}
            </span>
            {signal.category && (
              <span className={`relative z-10 ${signal.category === "beach-to-water" ? "chip-beach" : "chip-water"}`}>
                {signal.category === "beach-to-water" ? "From the beach" : "From the water"}
              </span>
            )}
          </div>
          <h2 className="relative z-10 pr-14 text-4xl font-extrabold uppercase leading-none">
            {signal.name}
          </h2>
          {showDescription && (
            <p className="relative z-10 pr-14 mt-2 text-white/90">{signal.description}</p>
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
              <div className="mb-6 p-5 bg-sand rounded-md border-2 border-ink">
                <p className="text-ink font-medium">
                  Perform this signal physically, then reveal the reference to check your form.
                </p>
              </div>
              <button
                onClick={handleReveal}
                className="btn-primary w-full"
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
                Compare with the picture. Did you get it right?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAnswer(false)}
                  className="btn-outline flex-1 px-3"
                >
                  ✗ I got it wrong
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="btn-secondary flex-1 px-3"
                >
                  ✓ I got it right
                </button>
              </div>
            </div>
          )}

          {/* Answered phase - show next button */}
          {performPhase === "answered" && (
            <button
              onClick={handleNext}
              className="btn-primary w-full"
            >
              Next Signal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

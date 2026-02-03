"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import PoseOverlay from "./PoseOverlay";
import DetectionFeedback from "./DetectionFeedback";

interface CameraViewProps {
  signalName: string;
  onMatch: () => void;
  onSkipCamera: () => void;
  enabled?: boolean;
  cameraPermissionGranted?: boolean;
  timeRemaining?: number;
  isDetectable?: boolean;
  onSelfAssess?: (correct: boolean) => void;
}

export default function CameraView({
  signalName,
  onMatch,
  onSkipCamera,
  enabled = true,
  cameraPermissionGranted = false,
  timeRemaining,
  isDetectable = true,
  onSelfAssess,
}: CameraViewProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { videoRef, cameraState, startCamera, stopCamera, switchCamera, error } = useCamera({
    facingMode: "user",
    width: 640,
    height: 480,
  });

  const {
    detectionState,
    landmarks,
    confidence,
    feedback,
    isMatch,
    initializeDetector,
    startDetection,
    stopDetection,
  } = usePoseDetection({
    signalName,
    onMatch,
    enabled: enabled && cameraState.isActive && isDetectable,
  });

  // Auto-start camera when permission is already granted
  useEffect(() => {
    if (enabled && cameraPermissionGranted && !cameraState.isActive) {
      startCamera();
    }
  }, [enabled, cameraPermissionGranted, cameraState.isActive, startCamera]);

  // Initialize detector on mount (only for detectable signals)
  useEffect(() => {
    if (enabled && isDetectable && !isInitialized) {
      initializeDetector().then(() => {
        setIsInitialized(true);
      });
    }
  }, [enabled, isDetectable, isInitialized, initializeDetector]);

  // Start detection when camera is active (only for detectable signals)
  useEffect(() => {
    if (cameraState.isActive && videoRef.current && isInitialized && isDetectable) {
      const video = videoRef.current;

      const handleCanPlay = () => {
        if (video.videoWidth && video.videoHeight) {
          setVideoSize({
            width: video.videoWidth,
            height: video.videoHeight,
          });
        }
        startDetection(video);
      };

      if (video.readyState >= 3) {
        handleCanPlay();
      } else {
        video.addEventListener("canplay", handleCanPlay, { once: true });
        return () => video.removeEventListener("canplay", handleCanPlay);
      }
    }

    return () => {
      if (!cameraState.isActive) {
        stopDetection();
      }
    };
  }, [cameraState.isActive, isInitialized, isDetectable, startDetection, stopDetection, videoRef]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopDetection();
    };
  }, [stopCamera, stopDetection]);

  const handleRequestPermission = useCallback(async () => {
    await startCamera();
  }, [startCamera]);

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (timeRemaining === undefined) return "text-white";
    if (timeRemaining <= 5) return "text-red-400";
    if (timeRemaining <= 10) return "text-yellow-300";
    return "text-white";
  };

  // If camera not active and permission not granted, show a fallback
  if (!cameraState.isActive && !cameraPermissionGranted) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-600 mb-3">
          Camera access is needed for detection.
        </p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={handleRequestPermission}
            className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
          >
            Enable Camera
          </button>
          <button
            onClick={onSkipCamera}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Skip Camera
          </button>
        </div>
      </div>
    );
  }

  // Loading state while camera starts
  if (!cameraState.isActive && cameraPermissionGranted) {
    return (
      <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
          <p className="text-sm">Starting camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera container */}
      <div
        ref={containerRef}
        className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden"
      >
        {/* Video element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Pose overlay (only for detectable signals) */}
        {isDetectable && (
          <PoseOverlay
            landmarks={landmarks}
            width={videoSize.width}
            height={videoSize.height}
            mirrored={true}
          />
        )}

        {/* Timer display */}
        {timeRemaining !== undefined && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`bg-black/60 rounded-full w-12 h-12 flex items-center justify-center ${getTimerColor()}`}>
              <span className="text-lg font-bold">{timeRemaining}</span>
            </div>
          </div>
        )}

        {/* Detection state indicator (only for detectable signals) */}
        {isDetectable && detectionState === "initializing" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
              <p className="text-sm">Initializing detector...</p>
            </div>
          </div>
        )}

        {isDetectable && detectionState === "no_pose" && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-sm rounded-lg px-3 py-2 text-center">
            Make sure you&apos;re visible in the camera
          </div>
        )}

        {/* Non-detectable signal hint */}
        {!isDetectable && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-sm rounded-lg px-3 py-2 text-center">
            Use the camera as a mirror to check your form
          </div>
        )}

        {/* Success overlay */}
        {isMatch && isDetectable && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-pulse">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Camera controls */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={switchCamera}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
            title="Switch camera"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Detection feedback (only for detectable signals) */}
      {isDetectable && (
        <DetectionFeedback
          confidence={confidence}
          isMatch={isMatch}
          feedback={feedback}
          signalName={signalName}
        />
      )}

      {/* Buttons */}
      {!isMatch && (
        <div className="flex gap-3">
          <button
            onClick={onSkipCamera}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Skip Camera
          </button>
          {/* For non-detectable signals, show self-assess buttons */}
          {!isDetectable && onSelfAssess ? (
            <>
              <button
                onClick={() => onSelfAssess(false)}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
              >
                Incorrect
              </button>
              <button
                onClick={() => onSelfAssess(true)}
                className="flex-1 py-3 px-4 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all"
              >
                Correct
              </button>
            </>
          ) : (
            <button
              onClick={onMatch}
              className="flex-1 py-3 px-4 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all"
            >
              I Did It
            </button>
          )}
        </div>
      )}
    </div>
  );
}

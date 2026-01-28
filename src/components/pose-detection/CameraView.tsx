"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import PoseOverlay from "./PoseOverlay";
import DetectionFeedback from "./DetectionFeedback";
import CameraPermissionPrompt from "./CameraPermissionPrompt";
import { isSignalDetectable } from "@/lib/pose/signalDefinitions";
import { getSignalPoseDescription } from "@/lib/pose/poseMatching";

interface CameraViewProps {
  signalName: string;
  onMatch: () => void;
  onSkipCamera: () => void;
  enabled?: boolean;
}

export default function CameraView({
  signalName,
  onMatch,
  onSkipCamera,
  enabled = true,
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
    enabled: enabled && cameraState.isActive,
  });

  // Initialize detector on mount
  useEffect(() => {
    if (enabled && !isInitialized) {
      initializeDetector().then(() => {
        setIsInitialized(true);
      });
    }
  }, [enabled, isInitialized, initializeDetector]);

  // Start detection when camera is active
  useEffect(() => {
    if (cameraState.isActive && videoRef.current && isInitialized) {
      // Wait for video to be ready
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
  }, [cameraState.isActive, isInitialized, startDetection, stopDetection, videoRef]);

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

  const isDetectable = isSignalDetectable(signalName);
  const poseDescription = getSignalPoseDescription(signalName);

  // Show permission prompt if camera not active
  if (!cameraState.isActive) {
    if (!isDetectable) {
      return (
        <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-200">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-amber-800 font-medium mb-3">
            Camera detection is not available for this signal yet.
          </p>
          <button
            onClick={onSkipCamera}
            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium hover:bg-amber-200 transition-all"
          >
            Continue Without Camera
          </button>
        </div>
      );
    }

    return (
      <CameraPermissionPrompt
        onRequestPermission={handleRequestPermission}
        onSkip={onSkipCamera}
        error={error}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Pose description */}
      <div className="text-center bg-primary/10 rounded-lg p-3">
        <p className="text-sm font-medium text-primary-dark">{poseDescription}</p>
      </div>

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
          style={{ transform: "scaleX(-1)" }} // Mirror for selfie mode
        />

        {/* Pose overlay */}
        <PoseOverlay
          landmarks={landmarks}
          width={videoSize.width}
          height={videoSize.height}
          mirrored={true}
        />

        {/* Detection state indicator */}
        {detectionState === "initializing" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
              <p className="text-sm">Initializing detector...</p>
            </div>
          </div>
        )}

        {detectionState === "no_pose" && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-sm rounded-lg px-3 py-2 text-center">
            Make sure you&apos;re visible in the camera
          </div>
        )}

        {/* Success overlay */}
        {isMatch && (
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

      {/* Detection feedback */}
      <DetectionFeedback
        confidence={confidence}
        isMatch={isMatch}
        feedback={feedback}
        signalName={signalName}
      />

      {/* Manual buttons */}
      {!isMatch && (
        <div className="flex gap-3">
          <button
            onClick={onSkipCamera}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Skip Camera
          </button>
          <button
            onClick={onMatch}
            className="flex-1 py-3 px-4 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all"
          >
            I Did It
          </button>
        </div>
      )}
    </div>
  );
}

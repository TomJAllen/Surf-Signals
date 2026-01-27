"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { PoseLandmarks, DetectionState, PoseMatchResult } from "@/types/pose";
import {
  initializePoseLandmarker,
  detectPose,
  isPoseLandmarkerReady,
} from "@/lib/pose/mediapipe";
import { matchPoseToSignal, MATCH_CONFIDENCE_THRESHOLD } from "@/lib/pose/poseMatching";

// Detection runs at ~15 FPS to balance accuracy and performance
const DETECTION_INTERVAL = 66; // ms

// Number of consecutive frames needed to confirm a match
const MATCH_CONFIRMATION_FRAMES = 5;

interface UsePoseDetectionOptions {
  signalName: string;
  onMatch?: () => void;
  enabled?: boolean;
}

interface UsePoseDetectionReturn {
  detectionState: DetectionState;
  landmarks: PoseLandmarks | null;
  matchResult: PoseMatchResult | null;
  confidence: number;
  feedback: string[];
  isMatch: boolean;
  initializeDetector: () => Promise<void>;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
}

export function usePoseDetection(options: UsePoseDetectionOptions): UsePoseDetectionReturn {
  const { signalName, onMatch, enabled = true } = options;

  const [detectionState, setDetectionState] = useState<DetectionState>("initializing");
  const [landmarks, setLandmarks] = useState<PoseLandmarks | null>(null);
  const [matchResult, setMatchResult] = useState<PoseMatchResult | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [isMatch, setIsMatch] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const matchCountRef = useRef(0);
  const matchCalledRef = useRef(false);

  // Initialize the pose landmarker
  const initializeDetector = useCallback(async () => {
    setDetectionState("initializing");

    try {
      await initializePoseLandmarker();
      setDetectionState("waiting_for_camera");
    } catch (error) {
      console.error("Failed to initialize pose detector:", error);
      setDetectionState("error");
    }
  }, []);

  // Start detection loop
  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      if (!enabled) return;

      videoRef.current = video;
      matchCountRef.current = 0;
      matchCalledRef.current = false;

      if (!isPoseLandmarkerReady()) {
        console.warn("Pose landmarker not ready, initializing...");
        initializeDetector().then(() => {
          startDetection(video);
        });
        return;
      }

      setDetectionState("detecting");

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start detection loop
      intervalRef.current = setInterval(() => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
          return;
        }

        const result = detectPose(videoRef.current, performance.now());

        if (result.landmarks) {
          setLandmarks(result.landmarks);
          setDetectionState("detecting");

          // Match against the target signal
          const match = matchPoseToSignal(result.landmarks, signalName);
          setMatchResult(match);
          setConfidence(match.confidence);
          setFeedback(match.feedback);

          // Check for confirmed match
          if (match.isMatch || match.confidence >= MATCH_CONFIDENCE_THRESHOLD) {
            matchCountRef.current++;

            if (matchCountRef.current >= MATCH_CONFIRMATION_FRAMES && !matchCalledRef.current) {
              setIsMatch(true);
              setDetectionState("matched");
              matchCalledRef.current = true;

              // Trigger match callback
              if (onMatch) {
                onMatch();
              }

              // Stop detection after match
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          } else {
            // Reset match counter if pose doesn't match
            matchCountRef.current = Math.max(0, matchCountRef.current - 1);
          }
        } else {
          setLandmarks(null);
          setDetectionState("no_pose");
          setMatchResult(null);
          setConfidence(0);
          setFeedback(["No pose detected - make sure you're visible in the camera"]);
          matchCountRef.current = 0;
        }
      }, DETECTION_INTERVAL);
    },
    [enabled, signalName, onMatch, initializeDetector]
  );

  // Stop detection loop
  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    videoRef.current = null;
    setDetectionState("waiting_for_camera");
    setLandmarks(null);
    setMatchResult(null);
    setConfidence(0);
    setFeedback([]);
    setIsMatch(false);
    matchCountRef.current = 0;
    matchCalledRef.current = false;
  }, []);

  // Reset match state when signal changes
  useEffect(() => {
    setIsMatch(false);
    matchCountRef.current = 0;
    matchCalledRef.current = false;
    setMatchResult(null);
    setConfidence(0);
    setFeedback([]);
  }, [signalName]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Don't dispose the landmarker on unmount - it's shared
      // disposePoseLandmarker();
    };
  }, []);

  return {
    detectionState,
    landmarks,
    matchResult,
    confidence,
    feedback,
    isMatch,
    initializeDetector,
    startDetection,
    stopDetection,
  };
}

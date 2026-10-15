"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { PoseLandmarks, DetectionState, PoseMatchResult, SignalMotion } from "@/types/pose";
import {
  initializePoseLandmarker,
  detectPose,
  isPoseLandmarkerReady,
} from "@/lib/pose/mediapipe";
import { matchPoseToSignal } from "@/lib/pose/poseMatching";
import { MOTION_HISTORY_FRAMES, measureMotion, type MotionMetrics } from "@/lib/pose/motion";
import { getSignalDefinitions } from "@/lib/pose/signalDefinitions";

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
  /** Movement the signal needs (wave/circle), or null for a static pose */
  motionType: SignalMotion | null;
  /** Live movement measurement for motion signals (null when not applicable) */
  motionMetrics: MotionMetrics | null;
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
  const [motionMetrics, setMotionMetrics] = useState<MotionMetrics | null>(null);
  const motionType: SignalMotion | null =
    getSignalDefinitions(signalName).find((d) => d.motion)?.motion ?? null;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const matchCountRef = useRef(0);
  const matchCalledRef = useRef(false);
  // Recent frames, so movement-based signals (waving, circling) can be checked
  const historyRef = useRef<PoseLandmarks[]>([]);

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
      historyRef.current = [];

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

          historyRef.current.push(result.landmarks);
          if (historyRef.current.length > MOTION_HISTORY_FRAMES) historyRef.current.shift();

          // Match against the target signal
          const match = matchPoseToSignal(result.landmarks, signalName, historyRef.current);
          setMatchResult(match);
          setConfidence(match.confidence);
          setFeedback(match.feedback);
          setMotionMetrics(motionType ? measureMotion(historyRef.current, motionType) : null);

          // Check for confirmed match
          // Only a full match counts. (Previously a high partial-credit score could pass
          // even with a criterion unmet, e.g. the wrong arm raised.)
          if (match.isMatch) {
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
          setMotionMetrics(null);
          matchCountRef.current = 0;
          historyRef.current = [];
        }
      }, DETECTION_INTERVAL);
    },
    [enabled, signalName, motionType, onMatch, initializeDetector]
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
    setMotionMetrics(null);
    matchCountRef.current = 0;
    matchCalledRef.current = false;
    historyRef.current = [];
  }, []);

  // Reset match state when signal changes
  useEffect(() => {
    setIsMatch(false);
    matchCountRef.current = 0;
    matchCalledRef.current = false;
    historyRef.current = [];
    setMatchResult(null);
    setConfidence(0);
    setFeedback([]);
    setMotionMetrics(null);
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
    motionType,
    motionMetrics,
    initializeDetector,
    startDetection,
    stopDetection,
  };
}

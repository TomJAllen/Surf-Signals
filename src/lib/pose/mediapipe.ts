import {
  PoseLandmarker,
  FilesetResolver,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { PoseLandmarks, PoseDetectionResult } from "@/types/pose";

let poseLandmarker: PoseLandmarker | null = null;
let isInitializing = false;
let initPromise: Promise<PoseLandmarker> | null = null;

// MediaPipe model URL
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

// Initialize the pose landmarker
export async function initializePoseLandmarker(): Promise<PoseLandmarker> {
  // Return existing instance if available
  if (poseLandmarker) {
    return poseLandmarker;
  }

  // Return existing initialization promise if in progress
  if (initPromise) {
    return initPromise;
  }

  // Prevent multiple initializations
  if (isInitializing) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (poseLandmarker) {
          clearInterval(checkInterval);
          resolve(poseLandmarker);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Pose landmarker initialization timeout"));
      }, 30000);
    });
  }

  isInitializing = true;

  initPromise = (async () => {
    try {
      // Load the vision WASM files
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Create the pose landmarker
      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "GPU", // Falls back to CPU if GPU unavailable
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      return poseLandmarker;
    } catch (error) {
      isInitializing = false;
      initPromise = null;
      throw error;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

// Detect pose from a video frame
export function detectPose(
  video: HTMLVideoElement,
  timestamp: number
): PoseDetectionResult {
  if (!poseLandmarker) {
    return { landmarks: null, timestamp };
  }

  try {
    const result: PoseLandmarkerResult = poseLandmarker.detectForVideo(
      video,
      timestamp
    );

    // Return the first pose's landmarks if available
    if (result.landmarks && result.landmarks.length > 0) {
      const landmarks: PoseLandmarks = result.landmarks[0].map((lm) => ({
        x: lm.x,
        y: lm.y,
        z: lm.z,
        visibility: lm.visibility,
      }));

      return { landmarks, timestamp };
    }

    return { landmarks: null, timestamp };
  } catch (error) {
    console.error("Pose detection error:", error);
    return { landmarks: null, timestamp };
  }
}

// Check if pose landmarker is ready
export function isPoseLandmarkerReady(): boolean {
  return poseLandmarker !== null;
}

// Clean up pose landmarker
export function disposePoseLandmarker(): void {
  if (poseLandmarker) {
    poseLandmarker.close();
    poseLandmarker = null;
    initPromise = null;
    isInitializing = false;
  }
}

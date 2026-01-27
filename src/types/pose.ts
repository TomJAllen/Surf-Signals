// MediaPipe Pose Landmark types

export interface NormalizedLandmark {
  x: number; // 0-1, normalized to image width
  y: number; // 0-1, normalized to image height
  z: number; // Depth relative to hip center
  visibility?: number; // 0-1, confidence that the landmark is visible
}

export type PoseLandmarks = NormalizedLandmark[];

// MediaPipe Pose Landmark indices
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

// Arm position classifications
export type ArmPosition =
  | "raised_above_head"
  | "extended_horizontal"
  | "at_side"
  | "bent"
  | "unknown";

// Hand state (for future use with hand gestures)
export type HandState = "open" | "closed" | "unknown";

// Signal pose definition for matching
export interface SignalPoseDefinition {
  signalId: string; // Matches Signal.id
  signalName: string; // Human-readable name for display
  leftArm?: ArmPosition;
  rightArm?: ArmPosition;
  handsTouching?: boolean;
  additionalChecks?: (landmarks: PoseLandmarks) => boolean;
}

// Result from pose matching
export interface PoseMatchResult {
  isMatch: boolean;
  confidence: number; // 0-1
  feedback: string[]; // Hints like "Raise left arm higher"
  matchedCriteria: string[]; // Which criteria were met
  unmatchedCriteria: string[]; // Which criteria were not met
}

// Detection state for UI
export type DetectionState =
  | "initializing"
  | "waiting_for_camera"
  | "detecting"
  | "matched"
  | "no_pose"
  | "error";

// Camera state
export interface CameraState {
  isActive: boolean;
  hasPermission: boolean | null; // null = not yet requested
  error: string | null;
  facingMode: "user" | "environment";
}

// Pose detection result
export interface PoseDetectionResult {
  landmarks: PoseLandmarks | null;
  timestamp: number;
}

import type { NormalizedLandmark, PoseLandmarks, ArmPosition } from "@/types/pose";
import { POSE_LANDMARKS } from "@/types/pose";

// Thresholds for pose classification
const THRESHOLDS = {
  // Y position relative to shoulder for "above head" detection
  ABOVE_HEAD_Y_DIFF: 0.15, // Wrist must be this much above shoulder (normalized coords)

  // Angle tolerance for horizontal arm detection (degrees from horizontal)
  HORIZONTAL_ANGLE_TOLERANCE: 30,

  // Y position tolerance for arm at side (wrist below elbow)
  AT_SIDE_Y_DIFF: 0.05,

  // Minimum visibility confidence for landmark
  MIN_VISIBILITY: 0.5,

  // Distance threshold for hands touching (normalized coords)
  HANDS_TOUCHING_DISTANCE: 0.12,

  // Horizontal extension threshold (wrist must be this far from shoulder horizontally)
  HORIZONTAL_EXTENSION_MIN: 0.15,
};

// Calculate angle at elbow joint (in degrees)
export function calculateElbowAngle(
  shoulder: NormalizedLandmark,
  elbow: NormalizedLandmark,
  wrist: NormalizedLandmark
): number {
  // Vector from elbow to shoulder
  const upperArm = {
    x: shoulder.x - elbow.x,
    y: shoulder.y - elbow.y,
  };

  // Vector from elbow to wrist
  const forearm = {
    x: wrist.x - elbow.x,
    y: wrist.y - elbow.y,
  };

  // Calculate dot product
  const dot = upperArm.x * forearm.x + upperArm.y * forearm.y;

  // Calculate magnitudes
  const mag1 = Math.sqrt(upperArm.x ** 2 + upperArm.y ** 2);
  const mag2 = Math.sqrt(forearm.x ** 2 + forearm.y ** 2);

  // Avoid division by zero
  if (mag1 === 0 || mag2 === 0) return 0;

  // Calculate angle in radians, then convert to degrees
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

// Calculate the angle of the arm from horizontal (0 = horizontal, 90 = vertical up, -90 = vertical down)
export function calculateArmAngleFromHorizontal(
  shoulder: NormalizedLandmark,
  wrist: NormalizedLandmark
): number {
  // Calculate the angle from shoulder to wrist
  const dx = wrist.x - shoulder.x;
  const dy = wrist.y - shoulder.y; // Note: in image coords, Y increases downward

  // atan2 gives angle from positive x-axis
  // We negate dy because in image coordinates, up is negative
  const angleRad = Math.atan2(-dy, dx);
  return angleRad * (180 / Math.PI);
}

// Check if a landmark is sufficiently visible
function isLandmarkVisible(landmark: NormalizedLandmark): boolean {
  return (landmark.visibility ?? 0) >= THRESHOLDS.MIN_VISIBILITY;
}

// Get arm landmarks for a specific side
function getArmLandmarks(
  landmarks: PoseLandmarks,
  side: "left" | "right"
): { shoulder: NormalizedLandmark; elbow: NormalizedLandmark; wrist: NormalizedLandmark } | null {
  const shoulderIdx = side === "left" ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER;
  const elbowIdx = side === "left" ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW;
  const wristIdx = side === "left" ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST;

  const shoulder = landmarks[shoulderIdx];
  const elbow = landmarks[elbowIdx];
  const wrist = landmarks[wristIdx];

  if (!shoulder || !elbow || !wrist) return null;
  if (!isLandmarkVisible(shoulder) || !isLandmarkVisible(elbow) || !isLandmarkVisible(wrist)) {
    return null;
  }

  return { shoulder, elbow, wrist };
}

// Check if arm is raised above head
export function isArmAboveHead(landmarks: PoseLandmarks, side: "left" | "right"): boolean {
  const arm = getArmLandmarks(landmarks, side);
  if (!arm) return false;

  // Wrist should be significantly above shoulder (remember: lower Y = higher in image)
  const yDiff = arm.shoulder.y - arm.wrist.y;
  return yDiff > THRESHOLDS.ABOVE_HEAD_Y_DIFF;
}

// Check if arm is extended horizontally
export function isArmExtendedHorizontal(landmarks: PoseLandmarks, side: "left" | "right"): boolean {
  const arm = getArmLandmarks(landmarks, side);
  if (!arm) return false;

  // Calculate angle from horizontal
  const angle = calculateArmAngleFromHorizontal(arm.shoulder, arm.wrist);

  // Arm should be roughly horizontal (within tolerance)
  const isHorizontalAngle = Math.abs(angle) < THRESHOLDS.HORIZONTAL_ANGLE_TOLERANCE ||
                           Math.abs(Math.abs(angle) - 180) < THRESHOLDS.HORIZONTAL_ANGLE_TOLERANCE;

  // Wrist should be extended away from body horizontally
  const horizontalExtension = Math.abs(arm.wrist.x - arm.shoulder.x);
  const isExtended = horizontalExtension > THRESHOLDS.HORIZONTAL_EXTENSION_MIN;

  return isHorizontalAngle && isExtended;
}

// Check if arm is at side (relaxed position)
export function isArmAtSide(landmarks: PoseLandmarks, side: "left" | "right"): boolean {
  const arm = getArmLandmarks(landmarks, side);
  if (!arm) return false;

  // Wrist should be below shoulder
  const wristBelowShoulder = arm.wrist.y > arm.shoulder.y + THRESHOLDS.AT_SIDE_Y_DIFF;

  // Wrist should be relatively close to body (not extended horizontally)
  const horizontalExtension = Math.abs(arm.wrist.x - arm.shoulder.x);
  const isCloseToBody = horizontalExtension < THRESHOLDS.HORIZONTAL_EXTENSION_MIN;

  return wristBelowShoulder && isCloseToBody;
}

// Classify the position of an arm
export function classifyArmPosition(landmarks: PoseLandmarks, side: "left" | "right"): ArmPosition {
  if (isArmAboveHead(landmarks, side)) {
    return "raised_above_head";
  }

  if (isArmExtendedHorizontal(landmarks, side)) {
    return "extended_horizontal";
  }

  if (isArmAtSide(landmarks, side)) {
    return "at_side";
  }

  // Check if arm is bent but visible
  const arm = getArmLandmarks(landmarks, side);
  if (arm) {
    return "bent";
  }

  return "unknown";
}

// Check if hands are touching (close together)
export function areHandsTouching(landmarks: PoseLandmarks): boolean {
  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

  if (!leftWrist || !rightWrist) return false;
  if (!isLandmarkVisible(leftWrist) || !isLandmarkVisible(rightWrist)) return false;

  // Calculate distance between wrists
  const distance = Math.sqrt(
    (leftWrist.x - rightWrist.x) ** 2 +
    (leftWrist.y - rightWrist.y) ** 2
  );

  return distance < THRESHOLDS.HANDS_TOUCHING_DISTANCE;
}

// Check if both arms are in the same horizontal position
export function areBothArmsHorizontal(landmarks: PoseLandmarks): boolean {
  return isArmExtendedHorizontal(landmarks, "left") && isArmExtendedHorizontal(landmarks, "right");
}

// Check if both arms are raised above head
export function areBothArmsRaised(landmarks: PoseLandmarks): boolean {
  return isArmAboveHead(landmarks, "left") && isArmAboveHead(landmarks, "right");
}

// Get confidence score for how well an arm matches a position
export function getArmPositionConfidence(
  landmarks: PoseLandmarks,
  side: "left" | "right",
  targetPosition: ArmPosition
): number {
  const arm = getArmLandmarks(landmarks, side);
  if (!arm) return 0;

  switch (targetPosition) {
    case "raised_above_head": {
      const yDiff = arm.shoulder.y - arm.wrist.y;
      // Scale confidence based on how far above head the arm is
      const normalizedDiff = yDiff / (THRESHOLDS.ABOVE_HEAD_Y_DIFF * 2);
      return Math.min(1, Math.max(0, normalizedDiff));
    }

    case "extended_horizontal": {
      const angle = calculateArmAngleFromHorizontal(arm.shoulder, arm.wrist);
      const angleFromHorizontal = Math.min(
        Math.abs(angle),
        Math.abs(Math.abs(angle) - 180)
      );
      // Higher confidence when closer to horizontal
      const angleConfidence = 1 - (angleFromHorizontal / 90);

      // Also factor in extension
      const extension = Math.abs(arm.wrist.x - arm.shoulder.x);
      const extensionConfidence = Math.min(1, extension / THRESHOLDS.HORIZONTAL_EXTENSION_MIN);

      return (angleConfidence + extensionConfidence) / 2;
    }

    case "at_side": {
      const wristBelowAmount = arm.wrist.y - arm.shoulder.y;
      const belowConfidence = wristBelowAmount > 0 ? Math.min(1, wristBelowAmount / 0.3) : 0;

      const extension = Math.abs(arm.wrist.x - arm.shoulder.x);
      const closeConfidence = 1 - Math.min(1, extension / THRESHOLDS.HORIZONTAL_EXTENSION_MIN);

      return (belowConfidence + closeConfidence) / 2;
    }

    default:
      return 0;
  }
}

// Generate feedback for improving arm position
export function getArmPositionFeedback(
  landmarks: PoseLandmarks,
  side: "left" | "right",
  targetPosition: ArmPosition
): string | null {
  const currentPosition = classifyArmPosition(landmarks, side);
  const sideLabel = side === "left" ? "left" : "right";

  if (currentPosition === targetPosition) return null;

  switch (targetPosition) {
    case "raised_above_head":
      if (currentPosition === "extended_horizontal") {
        return `Raise your ${sideLabel} arm above your head`;
      }
      if (currentPosition === "at_side" || currentPosition === "bent") {
        return `Lift your ${sideLabel} arm straight up above your head`;
      }
      return `Raise your ${sideLabel} arm higher`;

    case "extended_horizontal":
      if (currentPosition === "raised_above_head") {
        return `Lower your ${sideLabel} arm to shoulder height`;
      }
      if (currentPosition === "at_side" || currentPosition === "bent") {
        return `Extend your ${sideLabel} arm out to the side`;
      }
      return `Straighten your ${sideLabel} arm horizontally`;

    case "at_side":
      return `Lower your ${sideLabel} arm to your side`;

    default:
      return null;
  }
}

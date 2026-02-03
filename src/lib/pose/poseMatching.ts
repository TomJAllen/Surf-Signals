import type { PoseLandmarks, SignalPoseDefinition, PoseMatchResult } from "@/types/pose";
import {
  classifyArmPosition,
  getArmPositionConfidence,
  getArmPositionFeedback,
  areHandsTouching,
} from "./poseAnalyzer";
import { getSignalDefinitions, SIGNAL_POSE_DESCRIPTIONS } from "./signalDefinitions";

// Confidence threshold for considering a match
export const MATCH_CONFIDENCE_THRESHOLD = 0.75;

// Match a pose against a specific signal definition
function matchPoseToDefinition(
  landmarks: PoseLandmarks,
  definition: SignalPoseDefinition
): PoseMatchResult {
  const matchedCriteria: string[] = [];
  const unmatchedCriteria: string[] = [];
  const feedback: string[] = [];
  let totalConfidence = 0;
  let criteriaCount = 0;

  // Check left arm position
  if (definition.leftArm) {
    criteriaCount++;
    const leftPosition = classifyArmPosition(landmarks, "left");
    const leftConfidence = getArmPositionConfidence(landmarks, "left", definition.leftArm);

    if (leftPosition === definition.leftArm) {
      matchedCriteria.push(`Left arm: ${definition.leftArm}`);
      totalConfidence += leftConfidence;
    } else {
      unmatchedCriteria.push(`Left arm: expected ${definition.leftArm}, got ${leftPosition}`);
      const hint = getArmPositionFeedback(landmarks, "left", definition.leftArm);
      if (hint) feedback.push(hint);
      totalConfidence += leftConfidence * 0.5; // Partial credit
    }
  }

  // Check right arm position
  if (definition.rightArm) {
    criteriaCount++;
    const rightPosition = classifyArmPosition(landmarks, "right");
    const rightConfidence = getArmPositionConfidence(landmarks, "right", definition.rightArm);

    if (rightPosition === definition.rightArm) {
      matchedCriteria.push(`Right arm: ${definition.rightArm}`);
      totalConfidence += rightConfidence;
    } else {
      unmatchedCriteria.push(`Right arm: expected ${definition.rightArm}, got ${rightPosition}`);
      const hint = getArmPositionFeedback(landmarks, "right", definition.rightArm);
      if (hint) feedback.push(hint);
      totalConfidence += rightConfidence * 0.5; // Partial credit
    }
  }

  // Check hands touching
  if (definition.handsTouching) {
    criteriaCount++;
    const touching = areHandsTouching(landmarks);

    if (touching) {
      matchedCriteria.push("Hands touching");
      totalConfidence += 1;
    } else {
      unmatchedCriteria.push("Hands not touching");
      feedback.push("Bring your hands together above your head");
      totalConfidence += 0.3; // Small partial credit if close
    }
  }

  // Run additional checks if defined
  if (definition.additionalChecks) {
    criteriaCount++;
    const passed = definition.additionalChecks(landmarks);

    if (passed) {
      matchedCriteria.push("Additional criteria met");
      totalConfidence += 1;
    } else {
      unmatchedCriteria.push("Additional criteria not met");
      totalConfidence += 0.2;
    }
  }

  // Calculate average confidence
  const confidence = criteriaCount > 0 ? totalConfidence / criteriaCount : 0;

  // Determine if it's a match
  const isMatch = unmatchedCriteria.length === 0 && confidence >= MATCH_CONFIDENCE_THRESHOLD;

  return {
    isMatch,
    confidence: Math.min(1, Math.max(0, confidence)),
    feedback,
    matchedCriteria,
    unmatchedCriteria,
  };
}

// Match a pose against a signal by name
// This tries all alternative definitions for a signal and returns the best match
export function matchPoseToSignal(
  landmarks: PoseLandmarks,
  signalName: string
): PoseMatchResult {
  const definitions = getSignalDefinitions(signalName);

  if (definitions.length === 0) {
    return {
      isMatch: false,
      confidence: 0,
      feedback: ["This signal does not have pose detection support"],
      matchedCriteria: [],
      unmatchedCriteria: ["No definition found"],
    };
  }

  // Try all definitions and return the best match
  let bestMatch: PoseMatchResult | null = null;

  for (const definition of definitions) {
    const result = matchPoseToDefinition(landmarks, definition);

    if (!bestMatch || result.confidence > bestMatch.confidence) {
      bestMatch = result;
    }

    // If we found a match, no need to try more definitions
    if (result.isMatch) {
      break;
    }
  }

  return bestMatch || {
    isMatch: false,
    confidence: 0,
    feedback: ["Unable to analyze pose"],
    matchedCriteria: [],
    unmatchedCriteria: [],
  };
}

// Get a user-friendly description of how to perform a signal
export function getSignalPoseDescription(signalName: string, dbPoseHint?: string | null): string {
  if (dbPoseHint) return dbPoseHint;
  return SIGNAL_POSE_DESCRIPTIONS[signalName] || "Perform the signal as shown";
}

// Calculate overall confidence level for UI display
export type ConfidenceLevel = "low" | "medium" | "high" | "matched";

export function getConfidenceLevel(confidence: number, isMatch: boolean): ConfidenceLevel {
  if (isMatch) return "matched";
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.5) return "medium";
  return "low";
}

// Get color for confidence level (Tailwind classes)
export function getConfidenceLevelColor(level: ConfidenceLevel): string {
  switch (level) {
    case "matched":
      return "text-green-500";
    case "high":
      return "text-green-400";
    case "medium":
      return "text-yellow-500";
    case "low":
      return "text-red-400";
  }
}

export function getConfidenceLevelBgColor(level: ConfidenceLevel): string {
  switch (level) {
    case "matched":
      return "bg-green-500";
    case "high":
      return "bg-green-400";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-red-400";
  }
}

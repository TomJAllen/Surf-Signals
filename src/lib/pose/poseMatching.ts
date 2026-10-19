import type { PoseLandmarks, SignalPoseDefinition, PoseMatchResult } from "@/types/pose";
import {
  classifyArmPosition,
  getArmPositionConfidence,
  getArmPositionFeedback,
  areHandsTouching,
} from "./poseAnalyzer";
import { getSignalDefinitions, SIGNAL_POSE_DESCRIPTIONS } from "./signalDefinitions";
import { detectMotion, motionFeedback, MOTION_HISTORY_FRAMES } from "./motion";

// Confidence threshold for considering a match
export const MATCH_CONFIDENCE_THRESHOLD = 0.75;

// Share of recent frames that must show the arm shape for a moving signal. While
// flapping, circling or cutting away, the arm only passes through the reference
// position, so the current frame alone isn't a fair test.
export const RECENT_SHAPE_FRACTION = 0.3;

interface StaticResult {
  matched: string[];
  unmatched: string[];
  feedback: string[];
  total: number;
  count: number;
}

// Arm shape, hands and extra checks for a single frame
function evaluateStatic(landmarks: PoseLandmarks, definition: SignalPoseDefinition): StaticResult {
  const r: StaticResult = { matched: [], unmatched: [], feedback: [], total: 0, count: 0 };

  for (const side of ["left", "right"] as const) {
    const expected = side === "left" ? definition.leftArm : definition.rightArm;
    if (!expected) continue;
    r.count++;
    const label = side === "left" ? "Left" : "Right";
    const position = classifyArmPosition(landmarks, side);
    const confidence = getArmPositionConfidence(landmarks, side, expected);

    if (position === expected) {
      r.matched.push(`${label} arm: ${expected}`);
      r.total += confidence;
    } else {
      r.unmatched.push(`${label} arm: expected ${expected}, got ${position}`);
      const hint = getArmPositionFeedback(landmarks, side, expected);
      if (hint) r.feedback.push(hint);
      r.total += confidence * 0.5; // Partial credit
    }
  }

  if (definition.handsTouching) {
    r.count++;
    if (areHandsTouching(landmarks)) {
      r.matched.push("Hands touching");
      r.total += 1;
    } else {
      r.unmatched.push("Hands not touching");
      r.feedback.push("Bring your hands together above your head");
      r.total += 0.3; // Small partial credit if close
    }
  }

  if (definition.additionalChecks) {
    r.count++;
    if (definition.additionalChecks(landmarks)) {
      r.matched.push("Additional criteria met");
      r.total += 1;
    } else {
      r.unmatched.push("Additional criteria not met");
      r.total += 0.2;
    }
  }

  return r;
}

// True if enough recent frames showed the definition's arm shape
export function shapeHeldRecently(history: PoseLandmarks[], definition: SignalPoseDefinition): boolean {
  const recent = history.slice(-MOTION_HISTORY_FRAMES);
  if (recent.length === 0) return false;
  const hits = recent.filter((frame) => evaluateStatic(frame, definition).unmatched.length === 0).length;
  return hits / recent.length >= RECENT_SHAPE_FRACTION;
}

// Match a pose against a specific signal definition
function matchPoseToDefinition(
  landmarks: PoseLandmarks,
  definition: SignalPoseDefinition,
  history: PoseLandmarks[] = []
): PoseMatchResult {
  let shape = evaluateStatic(landmarks, definition);

  // Moving signals: accept the shape if it was held in enough recent frames
  if (definition.motion && shape.unmatched.length > 0 && shapeHeldRecently(history, definition)) {
    shape = {
      matched: ["Arm shape held recently"],
      unmatched: [],
      feedback: [],
      total: shape.count,
      count: shape.count,
    };
  }

  const matchedCriteria = [...shape.matched];
  const unmatchedCriteria = [...shape.unmatched];
  const feedback = [...shape.feedback];
  let totalConfidence = shape.total;
  let criteriaCount = shape.count;

  // Movement is judged over recent frames, not this one
  if (definition.motion) {
    criteriaCount++;
    if (detectMotion(history, definition.motion)) {
      matchedCriteria.push(`Motion: ${definition.motion}`);
      totalConfidence += 1;
    } else {
      unmatchedCriteria.push(`Motion: ${definition.motion} not detected`);
      // Only prompt for the movement once the arm shape is right
      if (feedback.length === 0) feedback.push(motionFeedback(definition.motion));
      totalConfidence += 0.3;
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
  signalName: string,
  history: PoseLandmarks[] = []
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
    const result = matchPoseToDefinition(landmarks, definition, history);

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

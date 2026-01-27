import type { SignalPoseDefinition, PoseLandmarks } from "@/types/pose";
import { areHandsTouching, areBothArmsRaised } from "./poseAnalyzer";

// MVP Signal Definitions
// These are the static signals that can be detected with pose estimation

export const DETECTABLE_SIGNALS: SignalPoseDefinition[] = [
  // BEACH TO WATER SIGNALS
  {
    signalId: "remain-stationary",
    signalName: "Remain Stationary",
    // Both arms extended horizontally to sides
    rightArm: "extended_horizontal",
    leftArm: "extended_horizontal",
  },
  {
    signalId: "return-to-shore",
    signalName: "Return to Shore",
    // One arm raised above head - right arm variant
    rightArm: "raised_above_head",
    leftArm: "at_side",
  },
  {
    signalId: "return-to-shore-alt",
    signalName: "Return to Shore",
    // One arm raised above head - left arm variant
    leftArm: "raised_above_head",
    rightArm: "at_side",
  },
  {
    signalId: "go-right",
    signalName: "Go to the Right or Left",
    // One arm extended horizontally - right variant
    rightArm: "extended_horizontal",
    leftArm: "at_side",
  },
  {
    signalId: "go-left",
    signalName: "Go to the Right or Left",
    // One arm extended horizontally - left variant
    leftArm: "extended_horizontal",
    rightArm: "at_side",
  },

  // WATER TO BEACH SIGNALS
  {
    signalId: "emergency-evacuation",
    signalName: "Emergency Evacuation Alarm",
    // Both arms raised straight above head
    rightArm: "raised_above_head",
    leftArm: "raised_above_head",
  },
  {
    signalId: "submerged-victim",
    signalName: "Submerged Victim Missing",
    // Both arms crossed above head - detected as both arms raised with hands touching
    rightArm: "raised_above_head",
    leftArm: "raised_above_head",
    handsTouching: true,
    additionalChecks: (landmarks: PoseLandmarks) => {
      return areBothArmsRaised(landmarks) && areHandsTouching(landmarks);
    },
  },
];

// Map signal names to their definitions for easy lookup
export const SIGNAL_DEFINITIONS_BY_NAME: Record<string, SignalPoseDefinition[]> = {};

// Initialize the lookup map
DETECTABLE_SIGNALS.forEach((def) => {
  const name = def.signalName;
  if (!SIGNAL_DEFINITIONS_BY_NAME[name]) {
    SIGNAL_DEFINITIONS_BY_NAME[name] = [];
  }
  SIGNAL_DEFINITIONS_BY_NAME[name].push(def);
});

// Get signal definitions for a given signal name
export function getSignalDefinitions(signalName: string): SignalPoseDefinition[] {
  return SIGNAL_DEFINITIONS_BY_NAME[signalName] || [];
}

// Check if a signal is detectable (has pose definition)
export function isSignalDetectable(signalName: string): boolean {
  return signalName in SIGNAL_DEFINITIONS_BY_NAME;
}

// List of signal names that can be detected
export const DETECTABLE_SIGNAL_NAMES = [
  "Remain Stationary",
  "Return to Shore",
  "Go to the Right or Left",
  "Emergency Evacuation Alarm",
  "Submerged Victim Missing",
];

// Friendly description of what each signal looks like
export const SIGNAL_POSE_DESCRIPTIONS: Record<string, string> = {
  "Remain Stationary": "Extend both arms out to your sides horizontally",
  "Return to Shore": "Raise one arm straight up above your head",
  "Go to the Right or Left": "Extend one arm horizontally to the side, pointing in the direction",
  "Emergency Evacuation Alarm": "Raise both arms straight above your head",
  "Submerged Victim Missing": "Cross both arms above your head with hands touching",
};

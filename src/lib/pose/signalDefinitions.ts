import type { SignalPoseDefinition, PoseLandmarks } from "@/types/pose";
import { areHandsTouching, areBothArmsRaised } from "./poseAnalyzer";

// MVP Signal Definitions
// These are the 5 static signals that can be detected with pose estimation

export const DETECTABLE_SIGNALS: SignalPoseDefinition[] = [
  {
    signalId: "stop",
    signalName: "Stop",
    // One arm raised straight up with open palm facing forward
    // We detect either arm raised (user's preference)
    rightArm: "raised_above_head",
    leftArm: "at_side",
  },
  {
    signalId: "stop-alt",
    signalName: "Stop",
    // Alternative: left arm raised
    leftArm: "raised_above_head",
    rightArm: "at_side",
  },
  {
    signalId: "remain-stationary",
    signalName: "Remain Stationary",
    // Both arms extended horizontally to sides
    rightArm: "extended_horizontal",
    leftArm: "extended_horizontal",
  },
  {
    signalId: "turn-left-irb",
    signalName: "Turn Left (IRB)",
    // Left arm extended horizontally
    leftArm: "extended_horizontal",
    rightArm: "at_side",
  },
  {
    signalId: "turn-right-irb",
    signalName: "Turn Right (IRB)",
    // Right arm extended horizontally
    rightArm: "extended_horizontal",
    leftArm: "at_side",
  },
  {
    signalId: "message-received",
    signalName: "Message Received/Understood",
    // Both arms raised above head with hands touching
    rightArm: "raised_above_head",
    leftArm: "raised_above_head",
    handsTouching: true,
    additionalChecks: (landmarks: PoseLandmarks) => {
      // Additional check: hands should be close together above head
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
  "Stop",
  "Remain Stationary",
  "Turn Left (IRB)",
  "Turn Right (IRB)",
  "Message Received/Understood",
];

// Friendly description of what each signal looks like
export const SIGNAL_POSE_DESCRIPTIONS: Record<string, string> = {
  "Stop": "Raise one arm straight up above your head",
  "Remain Stationary": "Extend both arms out to your sides horizontally",
  "Turn Left (IRB)": "Extend your left arm horizontally to the side",
  "Turn Right (IRB)": "Extend your right arm horizontally to the side",
  "Message Received/Understood": "Raise both arms above your head with hands touching",
};

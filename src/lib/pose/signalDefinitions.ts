import type { SignalPoseDefinition, PoseLandmarks } from "@/types/pose";
import { areHandsTouching, areBothArmsRaised, isHandNearHead } from "./poseAnalyzer";

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

  // NEW SIGNALS

  {
    signalId: "attract-attention",
    signalName: "Attract Attention",
    // Arms crossed above head
    rightArm: "raised_above_head",
    leftArm: "raised_above_head",
    handsTouching: true,
    additionalChecks: (landmarks: PoseLandmarks) => {
      return areBothArmsRaised(landmarks) && areHandsTouching(landmarks);
    },
    motion: "wave",
  },

  {
    signalId: "pick-up-swimmers",
    signalName: "Pick Up Swimmers",
    // One arm horizontal, one raised - right horizontal variant
    rightArm: "extended_horizontal",
    leftArm: "raised_above_head",
  },
  {
    signalId: "pick-up-swimmers-alt",
    signalName: "Pick Up Swimmers",
    // One arm horizontal, one raised - left horizontal variant
    leftArm: "extended_horizontal",
    rightArm: "raised_above_head",
  },

  {
    signalId: "proceed-further-out",
    signalName: "Proceed Further Out to Sea",
    // Both arms raised above head
    rightArm: "raised_above_head",
    leftArm: "raised_above_head",
  },

  {
    signalId: "message-understood",
    signalName: "Message Understood, All Clear",
    // One arm raised above head - right variant
    rightArm: "raised_above_head",
    leftArm: "at_side",
  },
  {
    signalId: "message-understood-alt",
    signalName: "Message Understood, All Clear",
    // One arm raised above head - left variant
    leftArm: "raised_above_head",
    rightArm: "at_side",
  },

  {
    signalId: "pick-up-buoys",
    signalName: "Pick Up or Adjust Buoys",
    // Both arms extended horizontally
    rightArm: "extended_horizontal",
    leftArm: "extended_horizontal",
    motion: "circle",
  },

  {
    signalId: "assistance-required",
    signalName: "Assistance Required",
    // One arm raised above head - right variant
    rightArm: "raised_above_head",
    leftArm: "at_side",
    motion: "wave",
  },
  {
    signalId: "assistance-required-alt",
    signalName: "Assistance Required",
    // One arm raised above head - left variant
    leftArm: "raised_above_head",
    rightArm: "at_side",
    motion: "wave",
  },

  {
    signalId: "shore-signal-received",
    signalName: "Shore Signal Received and Understood",
    // One arm raised above head - right variant
    rightArm: "raised_above_head",
    leftArm: "at_side",
  },
  {
    signalId: "shore-signal-received-alt",
    signalName: "Shore Signal Received and Understood",
    // One arm raised above head - left variant
    leftArm: "raised_above_head",
    rightArm: "at_side",
  },

  {
    signalId: "all-clear-ok",
    signalName: "All Clear / OK",
    // Hand near head (touching head)
    rightArm: "raised_above_head",
    leftArm: "at_side",
    additionalChecks: (landmarks: PoseLandmarks) => {
      return isHandNearHead(landmarks);
    },
  },
  {
    signalId: "all-clear-ok-alt",
    signalName: "All Clear / OK",
    leftArm: "raised_above_head",
    rightArm: "at_side",
    additionalChecks: (landmarks: PoseLandmarks) => {
      return isHandNearHead(landmarks);
    },
  },

  {
    signalId: "powercraft-return",
    signalName: "Powercraft Wishes to Return to Shore",
    // One arm raised above head - right variant
    rightArm: "raised_above_head",
    leftArm: "at_side",
    motion: "circle",
  },
  {
    signalId: "powercraft-return-alt",
    signalName: "Powercraft Wishes to Return to Shore",
    // One arm raised above head - left variant
    leftArm: "raised_above_head",
    rightArm: "at_side",
    motion: "circle",
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
  "Attract Attention",
  "Pick Up Swimmers",
  "Proceed Further Out to Sea",
  "Message Understood, All Clear",
  "Pick Up or Adjust Buoys",
  "Assistance Required",
  "Shore Signal Received and Understood",
  "All Clear / OK",
  "Powercraft Wishes to Return to Shore",
];

// Friendly description of what each signal looks like
export const SIGNAL_POSE_DESCRIPTIONS: Record<string, string> = {
  "Remain Stationary": "Extend both arms out to your sides horizontally",
  "Return to Shore": "Raise one arm straight up above your head",
  "Go to the Right or Left": "Extend one arm horizontally to the side, pointing in the direction",
  "Emergency Evacuation Alarm": "Raise both arms straight above your head",
  "Submerged Victim Missing": "Cross both arms above your head with hands touching",
  "Attract Attention": "Cross both arms above your head and wave them side to side",
  "Pick Up Swimmers": "One arm extended horizontally, the other raised above your head",
  "Proceed Further Out to Sea": "Raise both arms straight above your head",
  "Message Understood, All Clear": "Raise one arm straight up above your head",
  "Pick Up or Adjust Buoys": "Extend both arms out to your sides and move them in circles",
  "Assistance Required": "Raise one arm above your head and wave it side to side",
  "Shore Signal Received and Understood": "Raise one arm straight up above your head",
  "All Clear / OK": "Place one hand on top of your head",
  "Powercraft Wishes to Return to Shore": "Raise one arm and move it in a circle",
};

// What the camera actually checks for a definition, ignoring which arm is which
function shapeKey(def: SignalPoseDefinition): string {
  const arms = [def.leftArm ?? "-", def.rightArm ?? "-"].sort().join("+");
  return [arms, def.handsTouching ? "touch" : "", def.additionalChecks ? "extra" : "", def.motion ?? ""].join("|");
}

// Other signals the camera can't tell apart from this one (same arm shape and movement).
// Used to be upfront in the UI that a camera "match" only confirms the shape.
export function getSignalsWithSameShape(signalName: string): string[] {
  const mine = new Set(getSignalDefinitions(signalName).map(shapeKey));
  if (mine.size === 0) return [];
  return Object.entries(SIGNAL_DEFINITIONS_BY_NAME)
    .filter(([name, defs]) => name !== signalName && defs.some((d) => mine.has(shapeKey(d))))
    .map(([name]) => name);
}

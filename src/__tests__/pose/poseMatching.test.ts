import { describe, it, expect } from "vitest";
import {
  matchPoseToSignal,
  getSignalPoseDescription,
  getConfidenceLevel,
  getConfidenceLevelColor,
  getConfidenceLevelBgColor,
  MATCH_CONFIDENCE_THRESHOLD,
} from "@/lib/pose/poseMatching";
import { isSignalDetectable, DETECTABLE_SIGNAL_NAMES } from "@/lib/pose/signalDefinitions";
import type { PoseLandmarks, NormalizedLandmark } from "@/types/pose";
import { POSE_LANDMARKS } from "@/types/pose";

// Helper to create a landmark with visibility
function createLandmark(x: number, y: number, z = 0, visibility = 1): NormalizedLandmark {
  return { x, y, z, visibility };
}

// Helper to create a basic pose with all landmarks at default positions
function createBasePose(): PoseLandmarks {
  const landmarks: PoseLandmarks = [];

  for (let i = 0; i < 33; i++) {
    landmarks[i] = createLandmark(0.5, 0.5, 0, 1);
  }

  // Head
  landmarks[POSE_LANDMARKS.NOSE] = createLandmark(0.5, 0.2);

  // Shoulders
  landmarks[POSE_LANDMARKS.LEFT_SHOULDER] = createLandmark(0.4, 0.35);
  landmarks[POSE_LANDMARKS.RIGHT_SHOULDER] = createLandmark(0.6, 0.35);

  // Elbows at side
  landmarks[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.35, 0.5);
  landmarks[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.65, 0.5);

  // Wrists at side
  landmarks[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.35, 0.6);
  landmarks[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.65, 0.6);

  // Hips
  landmarks[POSE_LANDMARKS.LEFT_HIP] = createLandmark(0.45, 0.6);
  landmarks[POSE_LANDMARKS.RIGHT_HIP] = createLandmark(0.55, 0.6);

  return landmarks;
}

// Helper to create a "Remain Stationary" pose (both arms horizontal)
function createRemainStationaryPose(): PoseLandmarks {
  const pose = createBasePose();
  // Left arm horizontal
  pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.25, 0.35);
  pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.1, 0.35);
  // Right arm horizontal
  pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.75, 0.35);
  pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.9, 0.35);
  return pose;
}

// Helper to create a "Return to Shore" pose (one arm raised)
function createReturnToShorePose(): PoseLandmarks {
  const pose = createBasePose();
  // Right arm raised above head
  pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);
  pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1);
  return pose;
}

// Helper to create a "Go Right or Left" pose (one arm horizontal)
function createGoRightOrLeftPose(): PoseLandmarks {
  const pose = createBasePose();
  // Right arm horizontal
  pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.75, 0.35);
  pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.9, 0.35);
  return pose;
}

// Helper to create an "Emergency Evacuation" pose (both arms raised)
function createEmergencyEvacuationPose(): PoseLandmarks {
  const pose = createBasePose();
  // Left arm raised
  pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.4, 0.25);
  pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.4, 0.1);
  // Right arm raised
  pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);
  pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1);
  return pose;
}

// Helper to create a "Submerged Victim" pose (both arms raised, hands touching)
function createSubmergedVictimPose(): PoseLandmarks {
  const pose = createBasePose();
  // Left arm raised
  pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.4, 0.25);
  pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.48, 0.08);
  // Right arm raised
  pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);
  pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.52, 0.08);
  return pose;
}

describe("poseMatching", () => {
  describe("matchPoseToSignal", () => {
    describe("Remain Stationary signal", () => {
      it("matches when both arms extended horizontally", () => {
        const pose = createRemainStationaryPose();
        const result = matchPoseToSignal(pose, "Remain Stationary");

        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it("does not match with only one arm horizontal", () => {
        const pose = createGoRightOrLeftPose();
        const result = matchPoseToSignal(pose, "Remain Stationary");

        expect(result.isMatch).toBe(false);
      });
    });

    describe("Return to Shore signal", () => {
      it("matches when one arm is raised", () => {
        const pose = createReturnToShorePose();
        const result = matchPoseToSignal(pose, "Return to Shore");

        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it("provides feedback when pose is incorrect", () => {
        const pose = createBasePose(); // Arms at side
        const result = matchPoseToSignal(pose, "Return to Shore");

        expect(result.isMatch).toBe(false);
        expect(result.feedback.length).toBeGreaterThan(0);
      });
    });

    describe("Go to the Right or Left signal", () => {
      it("matches when one arm is horizontal and other at side", () => {
        const pose = createGoRightOrLeftPose();
        const result = matchPoseToSignal(pose, "Go to the Right or Left");

        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    describe("Emergency Evacuation Alarm signal", () => {
      it("matches when both arms raised above head", () => {
        const pose = createEmergencyEvacuationPose();
        const result = matchPoseToSignal(pose, "Emergency Evacuation Alarm");

        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it("does not match when only one arm raised", () => {
        const pose = createReturnToShorePose();
        const result = matchPoseToSignal(pose, "Emergency Evacuation Alarm");

        expect(result.isMatch).toBe(false);
      });
    });

    describe("Submerged Victim Missing signal", () => {
      it("matches when both arms raised with hands touching", () => {
        const pose = createSubmergedVictimPose();
        const result = matchPoseToSignal(pose, "Submerged Victim Missing");

        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it("does not match when only one arm raised", () => {
        const pose = createReturnToShorePose();
        const result = matchPoseToSignal(pose, "Submerged Victim Missing");

        expect(result.isMatch).toBe(false);
      });
    });

    describe("unknown signals", () => {
      it("returns no match for unknown signal", () => {
        const pose = createBasePose();
        const result = matchPoseToSignal(pose, "Unknown Signal Name");

        expect(result.isMatch).toBe(false);
        expect(result.confidence).toBe(0);
        expect(result.feedback).toContain("This signal does not have pose detection support");
      });
    });
  });

  describe("isSignalDetectable", () => {
    it("returns true for detectable signals", () => {
      expect(isSignalDetectable("Remain Stationary")).toBe(true);
      expect(isSignalDetectable("Return to Shore")).toBe(true);
      expect(isSignalDetectable("Go to the Right or Left")).toBe(true);
      expect(isSignalDetectable("Emergency Evacuation Alarm")).toBe(true);
      expect(isSignalDetectable("Submerged Victim Missing")).toBe(true);
    });

    it("returns false for non-detectable signals", () => {
      expect(isSignalDetectable("Attract Attention")).toBe(false);
      expect(isSignalDetectable("Pick Up Swimmers")).toBe(false);
      expect(isSignalDetectable("Unknown Signal")).toBe(false);
    });
  });

  describe("DETECTABLE_SIGNAL_NAMES", () => {
    it("contains all 5 detectable signals", () => {
      expect(DETECTABLE_SIGNAL_NAMES).toContain("Remain Stationary");
      expect(DETECTABLE_SIGNAL_NAMES).toContain("Return to Shore");
      expect(DETECTABLE_SIGNAL_NAMES).toContain("Go to the Right or Left");
      expect(DETECTABLE_SIGNAL_NAMES).toContain("Emergency Evacuation Alarm");
      expect(DETECTABLE_SIGNAL_NAMES).toContain("Submerged Victim Missing");
      expect(DETECTABLE_SIGNAL_NAMES).toHaveLength(5);
    });
  });

  describe("getSignalPoseDescription", () => {
    it("returns description for detectable signals", () => {
      const description = getSignalPoseDescription("Remain Stationary");
      expect(description).toBeTruthy();
      expect(description.toLowerCase()).toContain("arm");
    });

    it("returns generic description for unknown signals", () => {
      const description = getSignalPoseDescription("Unknown Signal");
      expect(description).toBe("Perform the signal as shown");
    });
  });

  describe("getConfidenceLevel", () => {
    it("returns matched when isMatch is true", () => {
      expect(getConfidenceLevel(0.9, true)).toBe("matched");
      expect(getConfidenceLevel(0.5, true)).toBe("matched");
    });

    it("returns high for confidence >= 0.75", () => {
      expect(getConfidenceLevel(0.75, false)).toBe("high");
      expect(getConfidenceLevel(0.99, false)).toBe("high");
    });

    it("returns medium for confidence >= 0.5", () => {
      expect(getConfidenceLevel(0.5, false)).toBe("medium");
      expect(getConfidenceLevel(0.74, false)).toBe("medium");
    });

    it("returns low for confidence < 0.5", () => {
      expect(getConfidenceLevel(0.49, false)).toBe("low");
      expect(getConfidenceLevel(0, false)).toBe("low");
    });
  });

  describe("getConfidenceLevelColor", () => {
    it("returns correct Tailwind classes for each level", () => {
      expect(getConfidenceLevelColor("matched")).toBe("text-green-500");
      expect(getConfidenceLevelColor("high")).toBe("text-green-400");
      expect(getConfidenceLevelColor("medium")).toBe("text-yellow-500");
      expect(getConfidenceLevelColor("low")).toBe("text-red-400");
    });
  });

  describe("getConfidenceLevelBgColor", () => {
    it("returns correct Tailwind background classes for each level", () => {
      expect(getConfidenceLevelBgColor("matched")).toBe("bg-green-500");
      expect(getConfidenceLevelBgColor("high")).toBe("bg-green-400");
      expect(getConfidenceLevelBgColor("medium")).toBe("bg-yellow-500");
      expect(getConfidenceLevelBgColor("low")).toBe("bg-red-400");
    });
  });

  describe("MATCH_CONFIDENCE_THRESHOLD", () => {
    it("is set to 0.75", () => {
      expect(MATCH_CONFIDENCE_THRESHOLD).toBe(0.75);
    });
  });
});

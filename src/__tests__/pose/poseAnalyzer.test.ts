import { describe, it, expect } from "vitest";
import {
  calculateElbowAngle,
  calculateArmAngleFromHorizontal,
  isArmAboveHead,
  isArmExtendedHorizontal,
  isArmAtSide,
  classifyArmPosition,
  areHandsTouching,
  areBothArmsHorizontal,
  areBothArmsRaised,
  getArmPositionConfidence,
  getArmPositionFeedback,
} from "@/lib/pose/poseAnalyzer";
import type { PoseLandmarks, NormalizedLandmark } from "@/types/pose";
import { POSE_LANDMARKS } from "@/types/pose";

// Helper to create a landmark with visibility
function createLandmark(x: number, y: number, z = 0, visibility = 1): NormalizedLandmark {
  return { x, y, z, visibility };
}

// Helper to create a basic pose with all landmarks
function createBasePose(): PoseLandmarks {
  const landmarks: PoseLandmarks = [];

  // Initialize all 33 landmarks with default positions
  for (let i = 0; i < 33; i++) {
    landmarks[i] = createLandmark(0.5, 0.5, 0, 1);
  }

  // Set realistic default positions
  // Head
  landmarks[POSE_LANDMARKS.NOSE] = createLandmark(0.5, 0.2);

  // Shoulders (at roughly 0.35 y)
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

describe("poseAnalyzer", () => {
  describe("calculateElbowAngle", () => {
    it("returns 180 degrees for a straight arm", () => {
      const shoulder = createLandmark(0.5, 0.3);
      const elbow = createLandmark(0.5, 0.5);
      const wrist = createLandmark(0.5, 0.7);

      const angle = calculateElbowAngle(shoulder, elbow, wrist);
      expect(angle).toBeCloseTo(180, 0);
    });

    it("returns 90 degrees for a right angle", () => {
      const shoulder = createLandmark(0.5, 0.3);
      const elbow = createLandmark(0.5, 0.5);
      const wrist = createLandmark(0.7, 0.5);

      const angle = calculateElbowAngle(shoulder, elbow, wrist);
      expect(angle).toBeCloseTo(90, 0);
    });

    it("returns 0 for degenerate case", () => {
      const shoulder = createLandmark(0.5, 0.5);
      const elbow = createLandmark(0.5, 0.5);
      const wrist = createLandmark(0.5, 0.5);

      const angle = calculateElbowAngle(shoulder, elbow, wrist);
      expect(angle).toBe(0);
    });
  });

  describe("calculateArmAngleFromHorizontal", () => {
    it("returns 0 for horizontal arm pointing right", () => {
      const shoulder = createLandmark(0.3, 0.5);
      const wrist = createLandmark(0.7, 0.5);

      const angle = calculateArmAngleFromHorizontal(shoulder, wrist);
      expect(angle).toBeCloseTo(0, 0);
    });

    it("returns 180 (or -180) for horizontal arm pointing left", () => {
      const shoulder = createLandmark(0.7, 0.5);
      const wrist = createLandmark(0.3, 0.5);

      const angle = calculateArmAngleFromHorizontal(shoulder, wrist);
      expect(Math.abs(angle)).toBeCloseTo(180, 0);
    });

    it("returns 90 for arm pointing straight up", () => {
      const shoulder = createLandmark(0.5, 0.5);
      const wrist = createLandmark(0.5, 0.2); // Lower y = higher in image

      const angle = calculateArmAngleFromHorizontal(shoulder, wrist);
      expect(angle).toBeCloseTo(90, 0);
    });

    it("returns -90 for arm pointing straight down", () => {
      const shoulder = createLandmark(0.5, 0.5);
      const wrist = createLandmark(0.5, 0.8);

      const angle = calculateArmAngleFromHorizontal(shoulder, wrist);
      expect(angle).toBeCloseTo(-90, 0);
    });
  });

  describe("isArmAboveHead", () => {
    it("returns true when arm is raised above head", () => {
      const pose = createBasePose();
      // Raise right arm above head (lower y = higher)
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1);
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);

      expect(isArmAboveHead(pose, "right")).toBe(true);
    });

    it("returns false when arm is at side", () => {
      const pose = createBasePose();

      expect(isArmAboveHead(pose, "right")).toBe(false);
      expect(isArmAboveHead(pose, "left")).toBe(false);
    });

    it("returns false when landmark visibility is low", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1, 0, 0.3);

      expect(isArmAboveHead(pose, "right")).toBe(false);
    });
  });

  describe("isArmExtendedHorizontal", () => {
    it("returns true when arm is extended horizontally to the side", () => {
      const pose = createBasePose();
      // Extend left arm horizontally
      pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.25, 0.35);
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.1, 0.35);

      expect(isArmExtendedHorizontal(pose, "left")).toBe(true);
    });

    it("returns true when right arm is extended horizontally", () => {
      const pose = createBasePose();
      // Extend right arm horizontally
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.75, 0.35);
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.9, 0.35);

      expect(isArmExtendedHorizontal(pose, "right")).toBe(true);
    });

    it("returns false when arm is at side", () => {
      const pose = createBasePose();

      expect(isArmExtendedHorizontal(pose, "left")).toBe(false);
      expect(isArmExtendedHorizontal(pose, "right")).toBe(false);
    });

    it("returns false when arm is raised", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1);

      expect(isArmExtendedHorizontal(pose, "right")).toBe(false);
    });
  });

  describe("isArmAtSide", () => {
    it("returns true when arm is relaxed at side", () => {
      const pose = createBasePose();

      expect(isArmAtSide(pose, "left")).toBe(true);
      expect(isArmAtSide(pose, "right")).toBe(true);
    });

    it("returns false when arm is raised", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1);

      expect(isArmAtSide(pose, "right")).toBe(false);
    });

    it("returns false when arm is extended horizontally", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.1, 0.35);

      expect(isArmAtSide(pose, "left")).toBe(false);
    });
  });

  describe("classifyArmPosition", () => {
    it("classifies arm raised above head", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1);
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);

      expect(classifyArmPosition(pose, "right")).toBe("raised_above_head");
    });

    it("classifies arm extended horizontal", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.25, 0.35);
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.1, 0.35);

      expect(classifyArmPosition(pose, "left")).toBe("extended_horizontal");
    });

    it("classifies arm at side", () => {
      const pose = createBasePose();

      expect(classifyArmPosition(pose, "left")).toBe("at_side");
      expect(classifyArmPosition(pose, "right")).toBe("at_side");
    });

    it("returns unknown when landmarks not visible", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.3, 0.5, 0, 0.2);

      expect(classifyArmPosition(pose, "left")).toBe("unknown");
    });
  });

  describe("areHandsTouching", () => {
    it("returns true when hands are close together", () => {
      const pose = createBasePose();
      // Position wrists close together above head
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.48, 0.1);
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.52, 0.1);

      expect(areHandsTouching(pose)).toBe(true);
    });

    it("returns false when hands are apart", () => {
      const pose = createBasePose();

      expect(areHandsTouching(pose)).toBe(false);
    });

    it("returns false when landmarks not visible", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.48, 0.1, 0, 0.3);
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.52, 0.1, 0, 0.3);

      expect(areHandsTouching(pose)).toBe(false);
    });
  });

  describe("areBothArmsHorizontal", () => {
    it("returns true when both arms extended horizontally", () => {
      const pose = createBasePose();
      // Left arm horizontal
      pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.25, 0.35);
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.1, 0.35);
      // Right arm horizontal
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.75, 0.35);
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.9, 0.35);

      expect(areBothArmsHorizontal(pose)).toBe(true);
    });

    it("returns false when only one arm is horizontal", () => {
      const pose = createBasePose();
      // Only left arm horizontal
      pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.25, 0.35);
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.1, 0.35);

      expect(areBothArmsHorizontal(pose)).toBe(false);
    });
  });

  describe("areBothArmsRaised", () => {
    it("returns true when both arms raised above head", () => {
      const pose = createBasePose();
      // Left arm raised
      pose[POSE_LANDMARKS.LEFT_ELBOW] = createLandmark(0.4, 0.25);
      pose[POSE_LANDMARKS.LEFT_WRIST] = createLandmark(0.45, 0.1);
      // Right arm raised
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.55, 0.1);

      expect(areBothArmsRaised(pose)).toBe(true);
    });

    it("returns false when only one arm is raised", () => {
      const pose = createBasePose();
      // Only right arm raised
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.55, 0.1);

      expect(areBothArmsRaised(pose)).toBe(false);
    });
  });

  describe("getArmPositionConfidence", () => {
    it("returns high confidence for correct position", () => {
      const pose = createBasePose();
      // Arm clearly raised above head
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.05);
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.2);

      const confidence = getArmPositionConfidence(pose, "right", "raised_above_head");
      expect(confidence).toBeGreaterThan(0.5);
    });

    it("returns low confidence for incorrect position", () => {
      const pose = createBasePose();

      const confidence = getArmPositionConfidence(pose, "right", "raised_above_head");
      expect(confidence).toBeLessThan(0.5);
    });

    it("returns 0 when landmarks not visible", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1, 0, 0.2);

      const confidence = getArmPositionConfidence(pose, "right", "raised_above_head");
      expect(confidence).toBe(0);
    });
  });

  describe("getArmPositionFeedback", () => {
    it("returns feedback for raising arm", () => {
      const pose = createBasePose();

      const feedback = getArmPositionFeedback(pose, "right", "raised_above_head");
      expect(feedback).toContain("right");
      expect(feedback?.toLowerCase()).toContain("arm");
    });

    it("returns feedback for lowering arm", () => {
      const pose = createBasePose();
      pose[POSE_LANDMARKS.RIGHT_WRIST] = createLandmark(0.6, 0.1);
      pose[POSE_LANDMARKS.RIGHT_ELBOW] = createLandmark(0.6, 0.25);

      const feedback = getArmPositionFeedback(pose, "right", "at_side");
      expect(feedback).toContain("right");
      expect(feedback?.toLowerCase()).toContain("lower");
    });

    it("returns null when position matches", () => {
      const pose = createBasePose();

      const feedback = getArmPositionFeedback(pose, "right", "at_side");
      expect(feedback).toBeNull();
    });
  });
});

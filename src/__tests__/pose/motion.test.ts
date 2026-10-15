import { describe, it, expect } from "vitest";
import { countReversals, detectMotion, measureMotion } from "@/lib/pose/motion";
import { matchPoseToSignal } from "@/lib/pose/poseMatching";
import { getSignalsWithSameShape } from "@/lib/pose/signalDefinitions";
import type { PoseLandmarks, NormalizedLandmark } from "@/types/pose";
import { POSE_LANDMARKS as L } from "@/types/pose";

const lm = (x: number, y: number, visibility = 1): NormalizedLandmark => ({ x, y, z: 0, visibility });

// Standing pose, shoulders 0.2 apart, both arms at sides
function basePose(): PoseLandmarks {
  const p: PoseLandmarks = Array.from({ length: 33 }, () => lm(0.5, 0.5));
  p[L.NOSE] = lm(0.5, 0.2);
  p[L.LEFT_SHOULDER] = lm(0.4, 0.35);
  p[L.RIGHT_SHOULDER] = lm(0.6, 0.35);
  p[L.LEFT_ELBOW] = lm(0.38, 0.5);
  p[L.RIGHT_ELBOW] = lm(0.62, 0.5);
  p[L.LEFT_WRIST] = lm(0.38, 0.62);
  p[L.RIGHT_WRIST] = lm(0.62, 0.62);
  return p;
}

// Right arm raised above head, wrist offset sideways by dx
function rightArmUp(dx = 0): PoseLandmarks {
  const p = basePose();
  p[L.RIGHT_ELBOW] = lm(0.62 + dx / 2, 0.22);
  p[L.RIGHT_WRIST] = lm(0.62 + dx, 0.08);
  return p;
}

// Both arms horizontal, wrists offset vertically by dy
function armsOut(dyLeft = 0, dyRight = 0): PoseLandmarks {
  const p = basePose();
  p[L.LEFT_ELBOW] = lm(0.27, 0.35 + dyLeft / 2);
  p[L.LEFT_WRIST] = lm(0.14, 0.35 + dyLeft);
  p[L.RIGHT_ELBOW] = lm(0.73, 0.35 + dyRight / 2);
  p[L.RIGHT_WRIST] = lm(0.86, 0.35 + dyRight);
  return p;
}

// 30 frames of a raised arm waving side to side (~2 full waves)
const wavingFrames = (): PoseLandmarks[] =>
  Array.from({ length: 30 }, (_, i) => rightArmUp(0.08 * Math.sin((i / 30) * 4 * Math.PI)));

// 30 frames of arms out, wrists tracing circles
const circlingFrames = (): PoseLandmarks[] =>
  Array.from({ length: 30 }, (_, i) => {
    const t = (i / 30) * 2 * Math.PI * 2;
    const p = armsOut(0.05 * Math.sin(t), 0.05 * Math.sin(t));
    p[L.LEFT_WRIST] = lm(0.14 + 0.05 * Math.cos(t), 0.35 + 0.05 * Math.sin(t));
    p[L.RIGHT_WRIST] = lm(0.86 + 0.05 * Math.cos(t), 0.35 + 0.05 * Math.sin(t));
    return p;
  });

const still = (pose: PoseLandmarks): PoseLandmarks[] => Array.from({ length: 30 }, () => pose);

describe("countReversals", () => {
  it("counts clear direction changes", () => {
    expect(countReversals([0, 1, 0, 1, 0], 0.5)).toBe(3);
  });

  it("ignores jitter inside the hysteresis band", () => {
    expect(countReversals([0, 0.05, 0, 0.05, 0, 0.05], 0.15)).toBe(0);
  });

  it("returns 0 for monotonic movement", () => {
    expect(countReversals([0, 0.2, 0.4, 0.6, 0.8], 0.1)).toBe(0);
  });
});

describe("detectMotion", () => {
  it("detects waving", () => {
    expect(detectMotion(wavingFrames(), "wave")).toBe(true);
  });

  it("does not detect waving when the arm is held still", () => {
    expect(detectMotion(still(rightArmUp()), "wave")).toBe(false);
  });

  it("detects circling", () => {
    expect(detectMotion(circlingFrames(), "circle")).toBe(true);
  });

  it("does not treat a still pose as circling", () => {
    expect(detectMotion(still(armsOut()), "circle")).toBe(false);
  });

  it("does not treat side-to-side waving as circling", () => {
    expect(detectMotion(wavingFrames(), "circle")).toBe(false);
  });

  it("needs enough frames before deciding", () => {
    expect(detectMotion(wavingFrames().slice(0, 4), "wave")).toBe(false);
  });

  it("ignores frames where the wrist isn't visible", () => {
    const hidden = wavingFrames().map((p) => {
      const copy = [...p];
      copy[L.RIGHT_WRIST] = { ...copy[L.RIGHT_WRIST], visibility: 0.1 };
      return copy;
    });
    expect(detectMotion(hidden, "wave")).toBe(false);
  });
});

describe("matching signals that need movement", () => {
  it("Assistance Required needs the wave, not just a raised arm", () => {
    const pose = rightArmUp();
    const held = matchPoseToSignal(pose, "Assistance Required", still(pose));
    expect(held.isMatch).toBe(false);
    expect(held.feedback).toContain("Now wave side to side");

    const frames = wavingFrames();
    const waved = matchPoseToSignal(frames[frames.length - 1], "Assistance Required", frames);
    expect(waved.isMatch).toBe(true);
  });

  it("a held raised arm still matches the static Return to Shore", () => {
    const pose = rightArmUp();
    expect(matchPoseToSignal(pose, "Return to Shore", still(pose)).isMatch).toBe(true);
  });

  it("Pick Up or Adjust Buoys needs circling; Remain Stationary doesn't", () => {
    const pose = armsOut();
    expect(matchPoseToSignal(pose, "Pick Up or Adjust Buoys", still(pose)).isMatch).toBe(false);
    expect(matchPoseToSignal(pose, "Remain Stationary", still(pose)).isMatch).toBe(true);

    const frames = circlingFrames();
    expect(
      matchPoseToSignal(frames[frames.length - 1], "Pick Up or Adjust Buoys", frames).isMatch
    ).toBe(true);
  });
});

describe("getSignalsWithSameShape", () => {
  it("lists static signals the camera can't tell apart", () => {
    const twins = getSignalsWithSameShape("Return to Shore");
    expect(twins).toContain("Message Understood, All Clear");
    expect(twins).toContain("Shore Signal Received and Understood");
    expect(twins).not.toContain("Return to Shore");
  });

  it("no longer groups movement signals with static lookalikes", () => {
    expect(getSignalsWithSameShape("Return to Shore")).not.toContain("Assistance Required");
    expect(getSignalsWithSameShape("Remain Stationary")).not.toContain("Pick Up or Adjust Buoys");
    expect(getSignalsWithSameShape("Submerged Victim Missing")).not.toContain("Attract Attention");
  });

  it("returns nothing for unknown signals", () => {
    expect(getSignalsWithSameShape("Unknown Signal")).toEqual([]);
  });
});

describe("measureMotion", () => {
  it("reports full progress and the moving wrist when waving", () => {
    const m = measureMotion(wavingFrames(), "wave");
    expect(m.detected).toBe(true);
    expect(m.progress).toBe(1);
    expect(m.side).toBe("right");
    expect(m.rangeX).toBeGreaterThanOrEqual(0.5);
  });

  it("reports partial progress for a single small sweep", () => {
    // One slow sweep of 0.3 shoulder widths: some range, no reversals yet
    const frames = Array.from({ length: 30 }, (_, i) => rightArmUp(0.06 * (i / 29)));
    const m = measureMotion(frames, "wave");
    expect(m.detected).toBe(false);
    expect(m.side).toBe("right");
    expect(m.progress).toBeGreaterThan(0);
    expect(m.progress).toBeLessThan(1);
    expect(m.rangeX).toBeGreaterThan(0.2);
  });

  it("reports zero progress with too few frames", () => {
    const m = measureMotion(wavingFrames().slice(0, 5), "wave");
    expect(m.detected).toBe(false);
    expect(m.progress).toBe(0);
    expect(m.samples).toBe(5);
  });

  it("agrees with detectMotion for circling", () => {
    expect(measureMotion(circlingFrames(), "circle").detected).toBe(detectMotion(circlingFrames(), "circle"));
    expect(measureMotion(still(armsOut()), "circle").detected).toBe(false);
  });

  it("returns empty metrics when no wrist is visible", () => {
    const hidden = still(rightArmUp()).map((f) => {
      const p = [...f];
      p[L.LEFT_WRIST] = lm(0.38, 0.62, 0);
      p[L.RIGHT_WRIST] = lm(0.62, 0.08, 0);
      return p;
    });
    const m = measureMotion(hidden, "wave");
    expect(m.side).toBeNull();
    expect(m.progress).toBe(0);
  });
});

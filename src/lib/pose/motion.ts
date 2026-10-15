import type { PoseLandmarks, SignalMotion } from "@/types/pose";
import { POSE_LANDMARKS } from "@/types/pose";

// How much history the detector keeps (≈2s at the 15fps detection rate)
export const MOTION_HISTORY_FRAMES = 30;

// Movement thresholds, as a fraction of shoulder width so they work at any distance from camera
const WAVE_MIN_AMPLITUDE = 0.5; // side-to-side range of the wrist
const CIRCLE_MIN_AMPLITUDE = 0.35; // range needed on BOTH axes
const REVERSAL_HYSTERESIS = 0.15; // ignore jitter smaller than this when counting direction changes
const MIN_VISIBILITY = 0.5;
const MIN_SAMPLES = 8;

type WristSide = "left" | "right";

function shoulderWidth(frame: PoseLandmarks): number | null {
  const l = frame[POSE_LANDMARKS.LEFT_SHOULDER];
  const r = frame[POSE_LANDMARKS.RIGHT_SHOULDER];
  if (!l || !r) return null;
  const w = Math.hypot(l.x - r.x, l.y - r.y);
  return w > 0.01 ? w : null;
}

// Wrist position relative to its shoulder, normalised by shoulder width,
// so leaning or stepping sideways doesn't count as waving.
function wristTrack(history: PoseLandmarks[], side: WristSide): { x: number; y: number }[] {
  const wristIdx = side === "left" ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST;
  const shoulderIdx = side === "left" ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER;
  const points: { x: number; y: number }[] = [];

  for (const frame of history) {
    const wrist = frame[wristIdx];
    const shoulder = frame[shoulderIdx];
    const width = shoulderWidth(frame);
    if (!wrist || !shoulder || !width) continue;
    if ((wrist.visibility ?? 0) < MIN_VISIBILITY) continue;
    points.push({ x: (wrist.x - shoulder.x) / width, y: (wrist.y - shoulder.y) / width });
  }
  return points;
}

function range(values: number[]): number {
  return values.length ? Math.max(...values) - Math.min(...values) : 0;
}

// Counts direction changes, ignoring wobble smaller than the hysteresis band
export function countReversals(values: number[], hysteresis = REVERSAL_HYSTERESIS): number {
  if (values.length < 3) return 0;
  let reversals = 0;
  let direction = 0; // 1 rising, -1 falling, 0 not yet established
  let extreme = values[0];
  const start = values[0];

  for (const v of values.slice(1)) {
    if (direction === 0) {
      // Wait until the value has clearly moved away from where it started
      if (v - start > hysteresis) {
        direction = 1;
        extreme = v;
      } else if (start - v > hysteresis) {
        direction = -1;
        extreme = v;
      }
    } else if (direction === 1) {
      if (v > extreme) extreme = v;
      else if (extreme - v > hysteresis) {
        reversals++;
        direction = -1;
        extreme = v;
      }
    } else {
      if (v < extreme) extreme = v;
      else if (v - extreme > hysteresis) {
        reversals++;
        direction = 1;
        extreme = v;
      }
    }
  }
  return reversals;
}

function sideShowsMotion(history: PoseLandmarks[], side: WristSide, motion: SignalMotion): boolean {
  const track = wristTrack(history, side);
  if (track.length < MIN_SAMPLES) return false;

  const xs = track.map((p) => p.x);
  const ys = track.map((p) => p.y);

  if (motion === "wave") {
    // Clear side-to-side sweep, back and forth at least once
    return range(xs) >= WAVE_MIN_AMPLITUDE && countReversals(xs) >= 2;
  }

  // circle: real movement on both axes, changing direction on both
  return (
    range(xs) >= CIRCLE_MIN_AMPLITUDE &&
    range(ys) >= CIRCLE_MIN_AMPLITUDE &&
    countReversals(xs) >= 1 &&
    countReversals(ys) >= 1
  );
}

// True if either wrist performed the required movement within the history window
export function detectMotion(history: PoseLandmarks[], motion: SignalMotion): boolean {
  const recent = history.slice(-MOTION_HISTORY_FRAMES);
  return sideShowsMotion(recent, "left", motion) || sideShowsMotion(recent, "right", motion);
}

export function motionFeedback(motion: SignalMotion): string {
  return motion === "wave"
    ? "Now wave side to side"
    : "Now move your arm in a circle";
}

import type { PoseLandmarks, SignalMotion } from "@/types/pose";
import { POSE_LANDMARKS } from "@/types/pose";

// How much history the detector keeps (≈2s at the 15fps detection rate)
export const MOTION_HISTORY_FRAMES = 30;

// Movement thresholds, as a fraction of shoulder width so they work at any distance from camera
const WAVE_MIN_AMPLITUDE = 0.5; // side-to-side range of the wrist
const CIRCLE_MIN_AMPLITUDE = 0.35; // range needed on BOTH axes
// A circle covers similar ground across and up-down; a flap or wave is much longer one way
const CIRCLE_MIN_ROUNDNESS = 0.4;
const FLAP_MIN_AMPLITUDE = 0.6; // up-down range of the wrist
// Cut-away: wrist starts well above the shoulder, then drops this far within a short window
const CUTAWAY_START_MAX_Y = -0.8; // wrist at least this far above the shoulder (negative = up)
const CUTAWAY_MIN_DROP = 1.2;
const CUTAWAY_MAX_FRAMES = 10; // ≈0.66s at 15fps — "quickly"
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

export interface MotionMetrics {
  side: WristSide | null; // wrist with the most progress
  samples: number; // usable frames for that wrist
  rangeX: number; // side-to-side range, in shoulder widths
  rangeY: number; // up-down range, in shoulder widths
  reversalsX: number;
  reversalsY: number;
  drop: number; // biggest quick fall of the wrist from above the shoulder (cut-away)
  progress: number; // 0..1 towards the requirement (for the on-screen indicator)
  detected: boolean;
}

export const MOTION_THRESHOLDS = {
  waveMinAmplitude: WAVE_MIN_AMPLITUDE,
  circleMinAmplitude: CIRCLE_MIN_AMPLITUDE,
  reversalHysteresis: REVERSAL_HYSTERESIS,
  minSamples: MIN_SAMPLES,
  waveMinReversals: 2,
  circleMinReversals: 1,
  flapMinAmplitude: FLAP_MIN_AMPLITUDE,
  flapMinReversals: 2,
  cutawayMinDrop: CUTAWAY_MIN_DROP,
} as const;

const EMPTY_METRICS: MotionMetrics = {
  side: null,
  samples: 0,
  rangeX: 0,
  rangeY: 0,
  reversalsX: 0,
  reversalsY: 0,
  drop: 0,
  progress: 0,
  detected: false,
};

// Largest fall of the wrist that starts above the shoulder and happens within a few frames
function quickestDrop(ys: number[]): number {
  let best = 0;
  for (let i = 0; i < ys.length; i++) {
    if (ys[i] > CUTAWAY_START_MAX_Y) continue;
    for (let j = i + 1; j < Math.min(ys.length, i + 1 + CUTAWAY_MAX_FRAMES); j++) {
      best = Math.max(best, ys[j] - ys[i]);
    }
  }
  return best;
}

const fraction = (value: number, target: number) => Math.min(1, value / target);
// Average of the partial requirements, kept below 1 until every one is met
const partial = (parts: number[]) => Math.min(0.95, parts.reduce((a, b) => a + b, 0) / parts.length);

function measureSide(history: PoseLandmarks[], side: WristSide, motion: SignalMotion): MotionMetrics {
  const track = wristTrack(history, side);
  const xs = track.map((p) => p.x);
  const ys = track.map((p) => p.y);
  const m = {
    side,
    samples: track.length,
    rangeX: range(xs),
    rangeY: range(ys),
    reversalsX: countReversals(xs),
    reversalsY: countReversals(ys),
    drop: quickestDrop(ys),
  };
  const enoughSamples = m.samples >= MIN_SAMPLES;
  const t = MOTION_THRESHOLDS;

  if (motion === "wave") {
    // Clear side-to-side sweep, back and forth at least once
    const parts = [fraction(m.rangeX, t.waveMinAmplitude), fraction(m.reversalsX, t.waveMinReversals)];
    const detected = enoughSamples && m.rangeX >= t.waveMinAmplitude && m.reversalsX >= t.waveMinReversals;
    return { ...m, detected, progress: detected ? 1 : enoughSamples ? partial(parts) : 0 };
  }

  if (motion === "flap") {
    // Arm raised and lowered, at least once up and once down
    const parts = [fraction(m.rangeY, t.flapMinAmplitude), fraction(m.reversalsY, t.flapMinReversals)];
    const detected = enoughSamples && m.rangeY >= t.flapMinAmplitude && m.reversalsY >= t.flapMinReversals;
    return { ...m, detected, progress: detected ? 1 : enoughSamples ? partial(parts) : 0 };
  }

  if (motion === "cutaway") {
    // Held up, then cut away sharply: one big, quick fall from above the shoulder
    const detected = enoughSamples && m.drop >= t.cutawayMinDrop;
    return { ...m, detected, progress: detected ? 1 : enoughSamples ? partial([fraction(m.drop, t.cutawayMinDrop)]) : 0 };
  }

  // circle: real movement on both axes, changing direction on both
  const parts = [
    fraction(m.rangeX, t.circleMinAmplitude),
    fraction(m.rangeY, t.circleMinAmplitude),
    fraction(m.reversalsX, t.circleMinReversals),
    fraction(m.reversalsY, t.circleMinReversals),
  ];
  const roundness = Math.min(m.rangeX, m.rangeY) / Math.max(m.rangeX, m.rangeY, 1e-6);
  const detected =
    enoughSamples &&
    roundness >= CIRCLE_MIN_ROUNDNESS &&
    m.rangeX >= t.circleMinAmplitude &&
    m.rangeY >= t.circleMinAmplitude &&
    m.reversalsX >= t.circleMinReversals &&
    m.reversalsY >= t.circleMinReversals;
  return { ...m, detected, progress: detected ? 1 : enoughSamples ? partial(parts) : 0 };
}

// Measures the required movement for whichever wrist is closest to completing it
export function measureMotion(history: PoseLandmarks[], motion: SignalMotion): MotionMetrics {
  const recent = history.slice(-MOTION_HISTORY_FRAMES);
  const sides = [measureSide(recent, "left", motion), measureSide(recent, "right", motion)];
  const score = (m: MotionMetrics) => (m.detected ? 2 : 0) + m.progress + (m.rangeX + m.rangeY + m.drop) / 100;
  const best = sides.reduce((a, b) => (score(b) > score(a) ? b : a));
  return best.samples > 0 ? best : { ...EMPTY_METRICS };
}

// True if either wrist performed the required movement within the history window
export function detectMotion(history: PoseLandmarks[], motion: SignalMotion): boolean {
  return measureMotion(history, motion).detected;
}

export const MOTION_LABELS: Record<SignalMotion, string> = {
  wave: "Wave",
  circle: "Circle",
  flap: "Up & down",
  cutaway: "Cut away",
};

export function motionFeedback(motion: SignalMotion): string {
  switch (motion) {
    case "wave":
      return "Now wave side to side";
    case "circle":
      return "Now move your arm in a circle";
    case "flap":
      return "Now move your arm up and down";
    case "cutaway":
      return "Hold it, then cut your arm away quickly to the side";
  }
}

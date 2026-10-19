"use client";

import { useEffect, useState } from "react";
import type { SignalMotion } from "@/types/pose";
import { MOTION_THRESHOLDS, type MotionMetrics } from "@/lib/pose/motion";

interface MotionIndicatorProps {
  motion: SignalMotion;
  metrics: MotionMetrics | null;
}

function debugLines(motion: SignalMotion, m: MotionMetrics, f: (n: number) => string): string[] {
  const t = MOTION_THRESHOLDS;
  switch (motion) {
    case "wave":
      return [`rangeX: ${f(m.rangeX)} / ${t.waveMinAmplitude}`, `reversalsX: ${m.reversalsX} / ${t.waveMinReversals}`];
    case "circle":
      return [
        `rangeX: ${f(m.rangeX)} / ${t.circleMinAmplitude}   rangeY: ${f(m.rangeY)} / ${t.circleMinAmplitude}`,
        `reversalsX: ${m.reversalsX} / ${t.circleMinReversals}   reversalsY: ${m.reversalsY} / ${t.circleMinReversals}`,
      ];
    case "flap":
      return [`rangeY: ${f(m.rangeY)} / ${t.flapMinAmplitude}`, `reversalsY: ${m.reversalsY} / ${t.flapMinReversals}`];
    case "cutaway":
      return [`drop: ${f(m.drop)} / ${t.cutawayMinDrop}`];
  }
}

// Shows how close the user's movement is to counting as a wave / circle.
// Add ?debug=motion to the URL to see the raw numbers used for tuning.
export default function MotionIndicator({ motion, metrics }: MotionIndicatorProps) {
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).get("debug") === "motion");
  }, []);

  const progress = metrics?.progress ?? 0;
  const detected = metrics?.detected ?? false;
  const t = MOTION_THRESHOLDS;
  const label = {
    wave: "Wave side to side",
    circle: "Move your arm in a circle",
    flap: "Move your arm up and down",
    cutaway: "Hold it up, then cut away to the side",
  }[motion];
  const f = (n: number) => n.toFixed(2);

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Movement: {label.toLowerCase()}</span>
        <span className={detected ? "text-green-600 font-bold" : "text-gray-500"}>
          {detected ? "Detected ✓" : `${Math.round(progress * 100)}%`}
        </span>
      </div>
      <div
        className="h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Movement progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className={`h-full transition-all duration-150 ${detected ? "bg-green-500" : "bg-secondary"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {debug && (
        <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
          {metrics
            ? [
                `wrist: ${metrics.side}  samples: ${metrics.samples}/${t.minSamples}`,
                ...debugLines(motion, metrics, f),
              ].join("\n")
            : "no pose"}
        </pre>
      )}
    </div>
  );
}

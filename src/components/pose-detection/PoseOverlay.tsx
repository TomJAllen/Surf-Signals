"use client";

import { useEffect, useRef } from "react";
import type { PoseLandmarks } from "@/types/pose";
import { POSE_LANDMARKS } from "@/types/pose";

interface PoseOverlayProps {
  landmarks: PoseLandmarks | null;
  width: number;
  height: number;
  mirrored?: boolean;
}

// Connections between landmarks to draw skeleton
const POSE_CONNECTIONS = [
  // Face
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_EYE],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_EYE],
  [POSE_LANDMARKS.LEFT_EYE, POSE_LANDMARKS.LEFT_EAR],
  [POSE_LANDMARKS.RIGHT_EYE, POSE_LANDMARKS.RIGHT_EAR],

  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],

  // Left arm
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_THUMB],
  [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_PINKY],
  [POSE_LANDMARKS.LEFT_WRIST, POSE_LANDMARKS.LEFT_INDEX],

  // Right arm
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_THUMB],
  [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_PINKY],
  [POSE_LANDMARKS.RIGHT_WRIST, POSE_LANDMARKS.RIGHT_INDEX],

  // Left leg
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_HEEL],
  [POSE_LANDMARKS.LEFT_ANKLE, POSE_LANDMARKS.LEFT_FOOT_INDEX],

  // Right leg
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_HEEL],
  [POSE_LANDMARKS.RIGHT_ANKLE, POSE_LANDMARKS.RIGHT_FOOT_INDEX],
];

// Key landmarks to highlight (arms are most important for signals)
const ARM_LANDMARKS = new Set<number>([
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.LEFT_ELBOW,
  POSE_LANDMARKS.LEFT_WRIST,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.RIGHT_ELBOW,
  POSE_LANDMARKS.RIGHT_WRIST,
]);

export default function PoseOverlay({
  landmarks,
  width,
  height,
  mirrored = true,
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!landmarks) return;

    // Draw connections
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;

    for (const [start, end] of POSE_CONNECTIONS) {
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];

      if (!startLandmark || !endLandmark) continue;
      if ((startLandmark.visibility ?? 0) < 0.5 || (endLandmark.visibility ?? 0) < 0.5) continue;

      let startX = startLandmark.x * width;
      let endX = endLandmark.x * width;

      // Mirror if using front camera
      if (mirrored) {
        startX = width - startX;
        endX = width - endX;
      }

      const startY = startLandmark.y * height;
      const endY = endLandmark.y * height;

      // Use different colors for arms
      const isArmConnection =
        ARM_LANDMARKS.has(start) || ARM_LANDMARKS.has(end);

      ctx.strokeStyle = isArmConnection
        ? "rgba(59, 130, 246, 0.9)" // Blue for arms
        : "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = isArmConnection ? 3 : 2;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Draw landmarks
    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      if (!landmark || (landmark.visibility ?? 0) < 0.5) continue;

      let x = landmark.x * width;
      if (mirrored) {
        x = width - x;
      }
      const y = landmark.y * height;

      // Larger circles for arm landmarks
      const isArmLandmark = ARM_LANDMARKS.has(i);
      const radius = isArmLandmark ? 6 : 4;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isArmLandmark
        ? "rgba(59, 130, 246, 1)" // Blue for arms
        : "rgba(255, 255, 255, 0.8)";
      ctx.fill();

      // White border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [landmarks, width, height, mirrored]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

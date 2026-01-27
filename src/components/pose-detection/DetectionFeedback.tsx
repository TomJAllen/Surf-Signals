"use client";

import { getConfidenceLevel, getConfidenceLevelBgColor } from "@/lib/pose/poseMatching";

interface DetectionFeedbackProps {
  confidence: number;
  isMatch: boolean;
  feedback: string[];
  signalName: string;
}

export default function DetectionFeedback({
  confidence,
  isMatch,
  feedback,
  signalName,
}: DetectionFeedbackProps) {
  const level = getConfidenceLevel(confidence, isMatch);
  const percentage = Math.round(confidence * 100);

  return (
    <div className="space-y-3">
      {/* Confidence indicator */}
      <div className="flex items-center gap-3">
        {/* Circular progress */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${percentage * 1.76} 176`}
              strokeLinecap="round"
              className={
                isMatch
                  ? "text-green-500"
                  : confidence >= 0.75
                  ? "text-green-400"
                  : confidence >= 0.5
                  ? "text-yellow-500"
                  : "text-red-400"
              }
              style={{
                transition: "stroke-dasharray 0.3s ease-out",
              }}
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`text-sm font-bold ${
                isMatch
                  ? "text-green-500"
                  : confidence >= 0.75
                  ? "text-green-400"
                  : confidence >= 0.5
                  ? "text-yellow-500"
                  : "text-red-400"
              }`}
            >
              {percentage}%
            </span>
          </div>
        </div>

        {/* Status text */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isMatch ? (
              <>
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-bold text-green-500">Signal Matched!</span>
              </>
            ) : (
              <>
                <div
                  className={`w-3 h-3 rounded-full ${getConfidenceLevelBgColor(level)} animate-pulse`}
                />
                <span className="font-medium text-gray-700">Detecting...</span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isMatch
                  ? "bg-green-500"
                  : confidence >= 0.75
                  ? "bg-green-400"
                  : confidence >= 0.5
                  ? "bg-yellow-500"
                  : "bg-red-400"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feedback hints */}
      {!isMatch && feedback.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-gray-600">
              {feedback.map((hint, index) => (
                <p key={index} className={index > 0 ? "mt-1" : ""}>
                  {hint}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {isMatch && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium text-green-700">
              Great job! You performed &quot;{signalName}&quot; correctly!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

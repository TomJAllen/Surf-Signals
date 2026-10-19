"use client";

import Link from "next/link";
import type { StudyMode, SessionConfig } from "@/types";
import Breadcrumbs from "@/components/Breadcrumbs";
import { QUICK_SESSION } from "@/lib/progress";

interface SessionSetupProps {
  mode: StudyMode;
  totalSignals: number;
  onStart: (config: SessionConfig) => void;
  cameraEnabled?: boolean;
  onCameraToggle?: (enabled: boolean) => void;
}

export default function SessionSetup({
  mode,
  totalSignals,
  onStart,
  cameraEnabled = false,
  onCameraToggle,
}: SessionSetupProps) {
  const isPerformMode = mode === "perform";
  const quick = Math.min(QUICK_SESSION, totalSignals);
  const start = (count: number) => onStart({ mode, category: null, count });

  const isIdentify = mode === "identify";

  return (
    <div className="max-w-md mx-auto px-4 space-y-3">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }, { href: "/test/signals", label: "Signals" }]} />
      <div className="card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-4 ${
            isIdentify ? "bg-secondary" : "bg-primary"
          }`}>
            {isIdentify ? (
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11" />
              </svg>
            )}
            <span className={`font-bold ${isIdentify ? "text-gray-900" : "text-white"}`}>
              {isIdentify ? "Identify Mode" : "Perform Mode"}
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold uppercase text-ink mb-2">
            {isIdentify ? "Name the signal" : "Do the signal"}
          </h1>
          <p className="text-gray-600">
            {isIdentify
              ? "You'll see each signal and pick its name from five options."
              : "You'll be given a signal name. Perform it, then check your form."}
          </p>
        </div>

        {/* Camera Toggle (Perform Mode Only) */}
        {isPerformMode && onCameraToggle && (
          <div className="mb-8">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cameraEnabled ? "bg-primary/20" : "bg-gray-200"}`}>
                  <svg
                    className={`w-5 h-5 ${cameraEnabled ? "text-primary" : "text-gray-500"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block">Camera Detection</span>
                  <span className="text-xs text-gray-500">
                    The camera checks your arm positions and gives you 15 seconds per signal
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={cameraEnabled}
                  onChange={(e) => onCameraToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </label>
          </div>
        )}

        {isPerformMode && cameraEnabled && (
          <ul className="-mt-4 mb-8 text-xs text-gray-600 bg-gray-50 rounded-xl p-4 space-y-1 list-disc list-inside">
            <li>Stand back so your head, arms and upper body are in frame</li>
            <li>Use good light and a plain background if you can</li>
            <li>Video is processed on your device and never uploaded</li>
          </ul>
        )}
        {isPerformMode && !cameraEnabled && onCameraToggle && (
          <p className="-mt-4 mb-8 text-xs text-gray-600 bg-gray-50 rounded-xl p-4">
            Without the camera, perform each signal, reveal the reference picture and mark
            yourself. There&apos;s no time limit.
          </p>
        )}

        {/* Start: a quick set that focuses on what you need, or all of them */}
        <div className="space-y-3">
          <button
            onClick={() => start(quick)}
            disabled={totalSignals === 0}
            className="btn-primary w-full disabled:opacity-50"
          >
            Start: {quick} signals
          </button>
          {totalSignals > quick && (
            <button onClick={() => start(totalSignals)} className="btn-outline w-full">
              All {totalSignals}
            </button>
          )}
          <p className="text-center text-xs text-stone-600">
            The {quick}-signal set focuses on the ones you&apos;re still getting wrong.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          New to the signals?{" "}
          <Link href="/learn/signals" className="text-primary font-semibold hover:underline">
            Learn them first
          </Link>
        </p>

      </div>
    </div>
  );
}

"use client";

interface CameraPermissionPromptProps {
  onRequestPermission: () => void;
  onSkip: () => void;
  error?: string | null;
}

export default function CameraPermissionPrompt({
  onRequestPermission,
  onSkip,
  error,
}: CameraPermissionPromptProps) {
  const isPermissionDenied = error?.includes("denied");

  return (
    <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
      {/* Camera icon */}
      <div className="mb-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-primary"
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
      </div>

      {/* Title and description */}
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        {isPermissionDenied ? "Camera Access Denied" : "Enable Camera Detection"}
      </h3>

      {error ? (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      ) : (
        <p className="text-sm text-gray-600 mb-4">
          Use your camera to automatically detect if you&apos;re performing the signal correctly.
          Your camera feed stays on your device and is never recorded or sent anywhere.
        </p>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {!isPermissionDenied && (
          <button
            onClick={onRequestPermission}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98]"
          >
            Enable Camera
          </button>
        )}

        {isPermissionDenied && (
          <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-700 mb-1">To enable camera access:</p>
            <ol className="text-left list-decimal list-inside space-y-1">
              <li>Click the camera/lock icon in your browser&apos;s address bar</li>
              <li>Allow camera access for this site</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        )}

        <button
          onClick={onSkip}
          className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
        >
          Skip Camera Detection
        </button>
      </div>

      {/* Privacy note */}
      {!error && (
        <p className="mt-4 text-xs text-gray-400">
          Privacy: All processing happens locally in your browser. No video data is stored or transmitted.
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { CameraState } from "@/types/pose";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraState: CameraState;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  error: string | null;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode: initialFacingMode = "user", width = 640, height = 480 } = options;

  const videoRef = useRef<HTMLVideoElement>(null!);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    hasPermission: null,
    error: null,
    facingMode: initialFacingMode,
  });

  // Connect stream to video element when both are available
  useEffect(() => {
    if (cameraState.isActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.error);
      }
    }
  }, [cameraState.isActive]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState((prev) => ({
      ...prev,
      isActive: false,
      error: null,
    }));
  }, []);

  const startCamera = useCallback(async () => {
    // Stop any existing stream first
    stopCamera();

    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: cameraState.facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Set isActive to true - the useEffect will connect the stream to the video element
      setCameraState((prev) => ({
        ...prev,
        isActive: true,
        hasPermission: true,
        error: null,
      }));
    } catch (err) {
      let errorMessage = "Failed to access camera";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMessage = "Camera permission denied. Please allow camera access to use this feature.";
          setCameraState((prev) => ({
            ...prev,
            isActive: false,
            hasPermission: false,
            error: errorMessage,
          }));
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMessage = "No camera found. Please connect a camera to use this feature.";
          setCameraState((prev) => ({
            ...prev,
            isActive: false,
            hasPermission: null,
            error: errorMessage,
          }));
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMessage = "Camera is in use by another application.";
          setCameraState((prev) => ({
            ...prev,
            isActive: false,
            hasPermission: true,
            error: errorMessage,
          }));
        } else {
          errorMessage = err.message || "Failed to access camera";
          setCameraState((prev) => ({
            ...prev,
            isActive: false,
            error: errorMessage,
          }));
        }
      }

      console.error("Camera error:", err);
    }
  }, [cameraState.facingMode, width, height, stopCamera]);

  const switchCamera = useCallback(async () => {
    const newFacingMode = cameraState.facingMode === "user" ? "environment" : "user";

    setCameraState((prev) => ({
      ...prev,
      facingMode: newFacingMode,
    }));

    // Only restart if camera was active
    if (cameraState.isActive) {
      // Stop current stream
      stopCamera();

      // Start with new facing mode after state update
      setTimeout(async () => {
        try {
          const constraints: MediaStreamConstraints = {
            video: {
              facingMode: newFacingMode,
              width: { ideal: width },
              height: { ideal: height },
            },
            audio: false,
          };

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }

          setCameraState((prev) => ({
            ...prev,
            isActive: true,
            error: null,
          }));
        } catch (err) {
          console.error("Failed to switch camera:", err);
          setCameraState((prev) => ({
            ...prev,
            error: "Failed to switch camera",
          }));
        }
      }, 100);
    }
  }, [cameraState.facingMode, cameraState.isActive, width, height, stopCamera]);

  return {
    videoRef,
    cameraState,
    startCamera,
    stopCamera,
    switchCamera,
    error: cameraState.error,
  };
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getLocalProgress,
  saveLocalAttempt,
  getLocalStats,
  clearLocalProgress,
  hasLocalProgress,
} from "@/lib/localStorage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("localStorage utility", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe("getLocalProgress", () => {
    it("returns empty progress when nothing stored", () => {
      const progress = getLocalProgress();
      expect(progress.attempts).toEqual([]);
    });

    it("returns stored progress", () => {
      const mockProgress = {
        attempts: [
          {
            signalId: "1",
            signalName: "Test Signal",
            mode: "identify" as const,
            correct: true,
            createdAt: "2024-01-01T00:00:00.000Z",
          },
        ],
        lastUpdated: "2024-01-01T00:00:00.000Z",
      };
      localStorageMock.setItem(
        "surf_signals_anonymous_progress",
        JSON.stringify(mockProgress)
      );

      const progress = getLocalProgress();
      expect(progress.attempts).toHaveLength(1);
      expect(progress.attempts[0].signalName).toBe("Test Signal");
    });
  });

  describe("saveLocalAttempt", () => {
    it("saves an attempt to localStorage", () => {
      saveLocalAttempt({
        signalId: "1",
        signalName: "Test Signal",
        mode: "identify",
        correct: true,
      });

      const progress = getLocalProgress();
      expect(progress.attempts).toHaveLength(1);
      expect(progress.attempts[0].correct).toBe(true);
    });

    it("limits attempts to 100", () => {
      // Add 101 attempts
      for (let i = 0; i < 101; i++) {
        saveLocalAttempt({
          signalId: String(i),
          signalName: `Signal ${i}`,
          mode: "identify",
          correct: true,
        });
      }

      const progress = getLocalProgress();
      expect(progress.attempts).toHaveLength(100);
    });
  });

  describe("getLocalStats", () => {
    it("returns zero stats when empty", () => {
      const stats = getLocalStats();
      expect(stats.overall.totalAttempts).toBe(0);
      expect(stats.overall.accuracy).toBe(0);
    });

    it("calculates correct stats", () => {
      saveLocalAttempt({
        signalId: "1",
        signalName: "Signal 1",
        mode: "identify",
        correct: true,
      });
      saveLocalAttempt({
        signalId: "2",
        signalName: "Signal 2",
        mode: "identify",
        correct: false,
      });
      saveLocalAttempt({
        signalId: "3",
        signalName: "Signal 3",
        mode: "perform",
        correct: true,
      });

      const stats = getLocalStats();
      expect(stats.overall.totalAttempts).toBe(3);
      expect(stats.overall.correctAttempts).toBe(2);
      expect(stats.overall.accuracy).toBe(67);
      expect(stats.byMode.identify.totalAttempts).toBe(2);
      expect(stats.byMode.perform.totalAttempts).toBe(1);
    });
  });

  describe("clearLocalProgress", () => {
    it("clears all progress", () => {
      saveLocalAttempt({
        signalId: "1",
        signalName: "Signal",
        mode: "identify",
        correct: true,
      });

      expect(hasLocalProgress()).toBe(true);

      clearLocalProgress();

      expect(hasLocalProgress()).toBe(false);
    });
  });

  describe("hasLocalProgress", () => {
    it("returns false when no progress", () => {
      expect(hasLocalProgress()).toBe(false);
    });

    it("returns true when progress exists", () => {
      saveLocalAttempt({
        signalId: "1",
        signalName: "Signal",
        mode: "identify",
        correct: true,
      });

      expect(hasLocalProgress()).toBe(true);
    });
  });
});

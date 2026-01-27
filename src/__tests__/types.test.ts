import { describe, it, expect } from "vitest";
import type { Signal, StudyMode, SignalCategory, SessionConfig } from "@/types";

describe("Types", () => {
  describe("Signal", () => {
    it("should have required properties", () => {
      const signal: Signal = {
        id: "1",
        name: "Test Signal",
        description: "A test signal",
        imageUrl: "/signals/beach-to-water/test.png",
        category: "beach-to-water",
      };

      expect(signal.id).toBe("1");
      expect(signal.name).toBe("Test Signal");
      expect(signal.description).toBe("A test signal");
      expect(signal.imageUrl).toBe("/signals/beach-to-water/test.png");
      expect(signal.category).toBe("beach-to-water");
    });

    it("should allow optional videoUrl", () => {
      const signalWithVideo: Signal = {
        id: "1",
        name: "Test Signal",
        description: "A test signal",
        imageUrl: "/signals/beach-to-water/test.png",
        category: "beach-to-water",
        videoUrl: "https://youtube.com/embed/abc123",
      };

      expect(signalWithVideo.videoUrl).toBe("https://youtube.com/embed/abc123");
    });
  });

  describe("StudyMode", () => {
    it("should only allow identify or perform", () => {
      const identifyMode: StudyMode = "identify";
      const performMode: StudyMode = "perform";

      expect(identifyMode).toBe("identify");
      expect(performMode).toBe("perform");
    });
  });

  describe("SignalCategory", () => {
    it("should only allow beach-to-water or water-to-beach", () => {
      const beachToWater: SignalCategory = "beach-to-water";
      const waterToBeach: SignalCategory = "water-to-beach";

      expect(beachToWater).toBe("beach-to-water");
      expect(waterToBeach).toBe("water-to-beach");
    });
  });

  describe("SessionConfig", () => {
    it("should have all required properties", () => {
      const config: SessionConfig = {
        mode: "identify",
        category: "beach-to-water",
        count: 10,
      };

      expect(config.mode).toBe("identify");
      expect(config.category).toBe("beach-to-water");
      expect(config.count).toBe(10);
    });

    it("should allow null category for all signals", () => {
      const config: SessionConfig = {
        mode: "perform",
        category: null,
        count: 5,
      };

      expect(config.category).toBeNull();
    });
  });
});

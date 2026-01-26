import { describe, it, expect } from "vitest";
import type { Signal, StudyMode, SignalCategory, SessionConfig } from "@/types";

describe("Types", () => {
  describe("Signal", () => {
    it("should have required properties", () => {
      const signal: Signal = {
        id: "1",
        name: "Test Signal",
        description: "A test signal",
        imageUrl: "/signals/test.svg",
        category: "water",
      };

      expect(signal.id).toBe("1");
      expect(signal.name).toBe("Test Signal");
      expect(signal.description).toBe("A test signal");
      expect(signal.imageUrl).toBe("/signals/test.svg");
      expect(signal.category).toBe("water");
    });

    it("should allow optional videoUrl", () => {
      const signalWithVideo: Signal = {
        id: "1",
        name: "Test Signal",
        description: "A test signal",
        imageUrl: "/signals/test.svg",
        category: "water",
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
    it("should only allow water, land, or irb", () => {
      const water: SignalCategory = "water";
      const land: SignalCategory = "land";
      const irb: SignalCategory = "irb";

      expect(water).toBe("water");
      expect(land).toBe("land");
      expect(irb).toBe("irb");
    });
  });

  describe("SessionConfig", () => {
    it("should have all required properties", () => {
      const config: SessionConfig = {
        mode: "identify",
        category: "water",
        count: 10,
      };

      expect(config.mode).toBe("identify");
      expect(config.category).toBe("water");
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

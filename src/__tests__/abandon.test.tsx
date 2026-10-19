import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const track = vi.fn();
vi.mock("@/lib/analytics", () => ({ track: (...a: unknown[]) => track(...a) }));
import { useAbandonTracking } from "@/lib/useAbandonTracking";

describe("drill_abandoned", () => {
  beforeEach(() => track.mockClear());

  it("fires once when leaving part-way through", () => {
    const { unmount } = renderHook(() => useAbandonTracking("mnemonic_quiz", "sample", 2, 6, false));
    window.dispatchEvent(new Event("pagehide"));
    unmount();
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("drill_abandoned", { drill: "mnemonic_quiz", item: "sample", answered: 2, total: 6 }, { leaving: true });
  });

  it("doesn't fire if nothing was answered or the test was finished", () => {
    renderHook(() => useAbandonTracking("radio_spell", null, 0, 6, false)).unmount();
    renderHook(() => useAbandonTracking("radio_spell", null, 6, 6, true)).unmount();
    expect(track).not.toHaveBeenCalled();
  });
});

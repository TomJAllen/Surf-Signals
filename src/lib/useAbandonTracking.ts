"use client";

import { useEffect, useRef } from "react";
import { track } from "./analytics";

// Records "drill_abandoned" if someone leaves a test part-way through: they
// answered at least one question but didn't finish. Fires once, when the test
// is left (navigating away, switching tab within the app, or closing the page).
export function useAbandonTracking(drill: string | undefined, item: string | null | undefined, answered: number, total: number, done: boolean) {
  const state = useRef({ answered, total, done, sent: false });
  state.current = { ...state.current, answered, total, done };

  useEffect(() => {
    if (!drill) return;
    state.current.sent = false;
    const send = (leaving: boolean) => {
      const s = state.current;
      if (s.sent || s.done || s.answered === 0) return;
      s.sent = true;
      track("drill_abandoned", { drill, item: item ?? null, answered: s.answered, total: s.total }, { leaving });
    };
    const onHide = () => send(true);
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      send(false);
    };
  }, [drill, item]);
}

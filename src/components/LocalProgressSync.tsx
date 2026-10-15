"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { clearLocalProgress, getLocalProgress } from "@/lib/localStorage";

// When someone signs in, move any progress they made as a guest into their account.
export default function LocalProgressSync() {
  const { status } = useSession();
  const syncing = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || syncing.current) return;

    const { attempts } = getLocalProgress();
    if (attempts.length === 0) return;

    syncing.current = true;
    fetch("/api/attempts/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attempts }),
    })
      .then((res) => {
        // Only clear once the server has accepted them
        if (res.ok) clearLocalProgress();
      })
      .catch((err) => console.error("Failed to import guest progress:", err))
      .finally(() => {
        syncing.current = false;
      });
  }, [status]);

  return null;
}

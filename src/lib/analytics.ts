"use client";

import type { PostHog } from "posthog-js";

// Anonymous product analytics (PostHog). Privacy settings:
// - no cookies: an anonymous random ID kept in localStorage
// - never identified: no names, emails or account IDs are sent
// - no session recording, no surveys; typed input is never captured
// - honours Do Not Track / Global Privacy Control, and an in-app opt-out
// - events go via our own domain (/ingest, see next.config.mjs)
// Also turn on "Discard client IP data" in the PostHog project settings.
// Does nothing unless NEXT_PUBLIC_POSTHOG_KEY is set.

const OPT_OUT_KEY = "ss-analytics-opt-out";
let started = false;
// Loaded on demand so the library isn't in every page's bundle
let posthog: PostHog | null = null;
// Events fired before the library finishes loading
const queue: [string, Record<string, unknown> | undefined][] = [];
let context: Record<string, string | number | boolean> = {};

export function analyticsConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

export function isOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function initAnalytics(): void {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (started || !key || typeof window === "undefined" || isOptedOut()) return;
  started = true;
  import("posthog-js").then(({ default: ph }) => {
    posthog = ph;
    ph.init(key, {
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_REGION === "eu" ? "https://eu.posthog.com" : "https://us.posthog.com",
    persistence: "localStorage",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: { dom_event_allowlist: ["click", "submit"] },
    disable_session_recording: true,
    disable_surveys: true,
    respect_dnt: true,
    mask_all_element_attributes: true,
    });
    ph.register(context);
    for (const [event, props] of queue.splice(0)) ph.capture(event, props);
  });
}

export function setAnalyticsOptOut(optOut: boolean): void {
  try {
    if (optOut) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    /* storage unavailable */
  }
  if (optOut) {
    posthog?.opt_out_capturing();
    queue.length = 0;
  } else if (started) {
    posthog?.opt_in_capturing();
  } else {
    initAnalytics();
  }
}

// Properties sent with every event (never personal data)
export function setAnalyticsContext(props: Record<string, string | number | boolean>): void {
  context = { ...context, ...props };
  posthog?.register(props);
}

export type AnalyticsEvent =
  | "drill_started"
  | "drill_completed"
  | "signal_session_completed"
  | "signal_attempt"
  | "camera_started"
  | "camera_error"
  | "signup_completed"
  | "terms_accepted"
  | "account_deleted";

export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean | null>): void {
  if (!started) return;
  if (posthog) posthog.capture(event, props ?? undefined);
  else if (queue.length < 50) queue.push([event, props ?? undefined]);
}

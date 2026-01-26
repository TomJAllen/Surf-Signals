// Simple privacy-friendly analytics utility
// Tracks study patterns without personally identifiable information

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: string;
}

const ANALYTICS_ENDPOINT = "/api/analytics";

// Track an analytics event
export async function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>
) {
  try {
    // Don't block on analytics - fire and forget
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        properties,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Silently fail - analytics should never break the app
    });
  } catch {
    // Silently fail
  }
}

// Pre-defined analytics events
export const Analytics = {
  // Session events
  sessionStarted: (mode: string, category: string | null, count: number) =>
    trackEvent("session_started", { mode, category: category || "all", count }),

  sessionCompleted: (
    mode: string,
    category: string | null,
    total: number,
    correct: number
  ) =>
    trackEvent("session_completed", {
      mode,
      category: category || "all",
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    }),

  // Signal events
  signalAttempt: (
    signalId: string,
    mode: string,
    correct: boolean,
    category: string
  ) =>
    trackEvent("signal_attempt", {
      signalId,
      mode,
      correct,
      category,
    }),

  // Page views
  pageView: (page: string) => trackEvent("page_view", { page }),

  // Feature usage
  videoViewed: (signalId: string) =>
    trackEvent("video_viewed", { signalId }),

  categoryFiltered: (category: string) =>
    trackEvent("category_filtered", { category }),

  // Account events
  signupStarted: () => trackEvent("signup_started"),
  signupCompleted: () => trackEvent("signup_completed"),
  loginCompleted: () => trackEvent("login_completed"),
};

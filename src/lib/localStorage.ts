// Local storage utility for anonymous user progress

const STORAGE_KEY = "surf_signals_anonymous_progress";

export interface LocalAttempt {
  signalId: string;
  signalName: string;
  mode: "identify" | "perform";
  correct: boolean;
  createdAt: string;
}

export interface LocalProgress {
  attempts: LocalAttempt[];
  lastUpdated: string;
}

export function getLocalProgress(): LocalProgress {
  if (typeof window === "undefined") {
    return { attempts: [], lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to read from localStorage:", error);
  }

  return { attempts: [], lastUpdated: new Date().toISOString() };
}

export function saveLocalAttempt(attempt: Omit<LocalAttempt, "createdAt">) {
  if (typeof window === "undefined") return;

  try {
    const progress = getLocalProgress();
    progress.attempts.push({
      ...attempt,
      createdAt: new Date().toISOString(),
    });
    progress.lastUpdated = new Date().toISOString();

    // Keep only the last 100 attempts to avoid storage bloat
    if (progress.attempts.length > 100) {
      progress.attempts = progress.attempts.slice(-100);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function getLocalStats() {
  const progress = getLocalProgress();
  const attempts = progress.attempts;

  if (attempts.length === 0) {
    return {
      overall: { totalAttempts: 0, correctAttempts: 0, accuracy: 0 },
      byMode: {
        identify: { totalAttempts: 0, correctAttempts: 0, accuracy: 0 },
        perform: { totalAttempts: 0, correctAttempts: 0, accuracy: 0 },
      },
      recentAttempts: [],
    };
  }

  const identifyAttempts = attempts.filter((a) => a.mode === "identify");
  const performAttempts = attempts.filter((a) => a.mode === "perform");

  const calcStats = (arr: LocalAttempt[]) => ({
    totalAttempts: arr.length,
    correctAttempts: arr.filter((a) => a.correct).length,
    accuracy:
      arr.length > 0
        ? Math.round((arr.filter((a) => a.correct).length / arr.length) * 100)
        : 0,
  });

  return {
    overall: calcStats(attempts),
    byMode: {
      identify: calcStats(identifyAttempts),
      perform: calcStats(performAttempts),
    },
    recentAttempts: attempts
      .slice(-10)
      .reverse()
      .map((a) => ({
        id: `local_${a.createdAt}`,
        signalName: a.signalName,
        mode: a.mode,
        correct: a.correct,
        createdAt: a.createdAt,
      })),
  };
}

export function clearLocalProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasLocalProgress(): boolean {
  if (typeof window === "undefined") return false;
  const progress = getLocalProgress();
  return progress.attempts.length > 0;
}

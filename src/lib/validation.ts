export const MIN_PASSWORD_LENGTH = 8;

export function normaliseEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  // Deliberately simple: one @, something either side, a dot in the domain.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || trimmed.length > 254) {
    return null;
  }
  return trimmed;
}

// Parse a positive integer query param, clamped to [1, max]. Returns fallback if absent/invalid.
export function clampLimit(raw: string | null, fallback: number, max: number): number {
  if (raw === null) return fallback;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

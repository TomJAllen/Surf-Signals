import { prisma } from "./prisma";

// Fixed-window rate limiting stored in Postgres, so it works across Vercel's
// serverless instances without another service.

export interface RateLimitRule {
  limit: number; // max requests per window
  windowSeconds: number;
}

export const RULES = {
  // Per email address and per IP, so neither a single account nor a single
  // attacker can be hammered
  loginPerEmail: { limit: 10, windowSeconds: 15 * 60 },
  loginPerIp: { limit: 30, windowSeconds: 15 * 60 },
  signupPerIp: { limit: 5, windowSeconds: 60 * 60 },
  writePerUser: { limit: 300, windowSeconds: 60 * 60 }, // attempts etc.
  accountActionPerUser: { limit: 10, windowSeconds: 60 * 60 }, // export / delete / password checks
  passwordResetPerIp: { limit: 10, windowSeconds: 60 * 60 }, // using a reset link
  forgotPasswordPerIp: { limit: 5, windowSeconds: 60 * 60 }, // asking for a reset email
  forgotPasswordPerEmail: { limit: 3, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

// Pure decision function (unit-tested): given the stored window, what happens now?
export function decide(
  stored: { count: number; windowStart: Date } | null,
  rule: RateLimitRule,
  now: Date
): { count: number; windowStart: Date; result: RateLimitResult } {
  const windowMs = rule.windowSeconds * 1000;
  const fresh = !stored || now.getTime() - stored.windowStart.getTime() >= windowMs;
  const windowStart = fresh ? now : stored!.windowStart;
  const count = (fresh ? 0 : stored!.count) + 1;
  const allowed = count <= rule.limit;
  const retryAfterSeconds = allowed ? 0 : Math.ceil((windowStart.getTime() + windowMs - now.getTime()) / 1000);
  return { count, windowStart, result: { allowed, remaining: Math.max(0, rule.limit - count), retryAfterSeconds } };
}

// Count this request against `key` and say whether it's allowed.
// Fails open if the database is unreachable (the request will fail anyway).
export async function rateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  try {
    const now = new Date();
    return await prisma.$transaction(async (tx) => {
      // Lock the row so concurrent requests count correctly
      const rows = await tx.$queryRaw<{ count: number; windowStart: Date }[]>`
        SELECT "count", "windowStart" FROM "RateLimit" WHERE "key" = ${key} FOR UPDATE`;
      const next = decide(rows[0] ?? null, rule, now);
      await tx.rateLimit.upsert({
        where: { key },
        create: { key, count: next.count, windowStart: next.windowStart },
        update: { count: next.count, windowStart: next.windowStart },
      });
      return next.result;
    });
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true, remaining: 0, retryAfterSeconds: 0 };
  }
}

// Remove windows older than a day (called from the daily cron)
export async function pruneRateLimits(): Promise<number> {
  const { count } = await prisma.rateLimit.deleteMany({
    where: { windowStart: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  });
  return count;
}

// Best-effort client IP. On Vercel, x-forwarded-for is set by the platform.
export function clientIp(headers: Headers | Record<string, string | string[] | undefined>): string {
  const get = (name: string): string | undefined => {
    if (headers instanceof Headers) return headers.get(name) ?? undefined;
    const v = headers[name];
    return Array.isArray(v) ? v[0] : v;
  };
  return (get("x-forwarded-for")?.split(",")[0] ?? get("x-real-ip") ?? "unknown").trim();
}

export function tooManyRequestsMessage(r: RateLimitResult): string {
  const minutes = Math.max(1, Math.ceil(r.retryAfterSeconds / 60));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

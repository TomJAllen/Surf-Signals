import { createHmac, timingSafeEqual } from "crypto";

// One-time password reset links, created by an admin from Admin → Users.
//
// The token is signed with NEXTAUTH_SECRET and bound to the user's current password
// hash, so it needs no database table and stops working as soon as it's used (the
// hash changes) or the user changes their password some other way. It also expires.
//
// Format: <userId>.<expiry in unix seconds>.<signature>
// The link carries it after "#", so it is never sent to the server in the URL,
// never appears in logs or the Referer header, and analytics ignore that page.

export const RESET_LINK_TTL_SECONDS = 60 * 60; // 1 hour

function signature(userId: string, exp: number, passwordHash: string, secret: string): string {
  return createHmac("sha256", secret).update(`pwreset|${userId}|${exp}|${passwordHash}`).digest("base64url");
}

export function createResetToken(
  userId: string,
  passwordHash: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): string {
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  const exp = nowSeconds + RESET_LINK_TTL_SECONDS;
  return `${userId}.${exp}.${signature(userId, exp, passwordHash, secret)}`;
}

// Reads the user id and expiry without trusting them yet
export function parseResetToken(token: unknown): { userId: string; exp: number; sig: string } | null {
  if (typeof token !== "string" || token.length > 300) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expRaw, sig] = parts;
  if (!/^[a-z0-9]{10,40}$/i.test(userId) || !/^\d{9,11}$/.test(expRaw) || !/^[A-Za-z0-9_-]{40,50}$/.test(sig)) {
    return null;
  }
  return { userId, exp: Number(expRaw), sig };
}

export function isResetTokenValid(
  parsed: { userId: string; exp: number; sig: string },
  passwordHash: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!secret) return false;
  if (parsed.exp < nowSeconds || parsed.exp > nowSeconds + RESET_LINK_TTL_SECONDS + 60) return false;
  const expected = Buffer.from(signature(parsed.userId, parsed.exp, passwordHash, secret));
  const given = Buffer.from(parsed.sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

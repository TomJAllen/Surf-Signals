import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pruneRateLimits } from "@/lib/rateLimit";

// Daily ping (see vercel.json) so the free Supabase project isn't paused for inactivity.
// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
export const dynamic = "force-dynamic";

// Constant-time comparison so the secret can't be guessed from response timing
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !safeEqual(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const signals = await prisma.signal.count();
    const prunedRateLimits = await pruneRateLimits();
    return NextResponse.json({ ok: true, signals, prunedRateLimits, at: new Date().toISOString() });
  } catch (error) {
    console.error("Keep-alive query failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

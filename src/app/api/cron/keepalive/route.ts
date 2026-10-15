import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Daily ping (see vercel.json) so the free Supabase project isn't paused for inactivity.
// Vercel Cron sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const signals = await prisma.signal.count();
    return NextResponse.json({ ok: true, signals, at: new Date().toISOString() });
  } catch (error) {
    console.error("Keep-alive query failed:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

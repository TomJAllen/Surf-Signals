import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";
import { parseDrillResult } from "@/lib/drillResults";
import { clampLimit } from "@/lib/validation";
import { dailyKey } from "@/lib/daily";
import { rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

// The signed-in user's finished tests and sessions, newest first (for History)
export async function GET(request: Request) {
  const { error, session } = await requireUser();
  if (error) return error;
  const limit = clampLimit(new URL(request.url).searchParams.get("limit"), 50, 200);
  const rows = await prisma.drillResult.findMany({
    where: { userId: session.user.id },
    select: { id: true, drill: true, item: true, score: true, total: true, mistakes: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return NextResponse.json(rows.map(({ createdAt, ...r }) => ({ ...r, at: createdAt.toISOString() })));
}

// Saves a finished test or session for the signed-in user
export async function POST(request: Request) {
  const { error, session } = await requireUser();
  if (error) return error;
  const userId = session.user.id;

  const limited = await rateLimit(`write:user:${userId}`, RULES.writePerUser);
  if (!limited.allowed) {
    return NextResponse.json({ error: tooManyRequestsMessage(limited) }, { status: 429 });
  }

  const result = parseDrillResult(await request.json().catch(() => null));
  if (!result) return NextResponse.json({ error: "Invalid result" }, { status: 400 });

  // Today's practice counts once a day (the first go), like the page shows
  if (result.drill === "daily_mix") {
    const last = await prisma.drillResult.findFirst({
      where: { userId, drill: "daily_mix" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    if (last && dailyKey(last.createdAt) === dailyKey()) return NextResponse.json({ ok: true, duplicate: true });
  }

  await prisma.drillResult.create({ data: { ...result, userId } });
  return NextResponse.json({ ok: true });
}

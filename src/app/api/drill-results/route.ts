import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";
import { parseDrillResult } from "@/lib/drillResults";
import { rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

// Saves a finished mnemonic or radio test for the signed-in user
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

  await prisma.drillResult.create({ data: { ...result, userId } });
  return NextResponse.json({ ok: true });
}

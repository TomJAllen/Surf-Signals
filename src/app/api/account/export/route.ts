import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";
import { rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Everything we hold about the signed-in user, as a downloadable JSON file
export async function GET() {
  const { error, session } = await requireUser();
  if (error) return error;
  const userId = session.user.id;

  const limited = await rateLimit(`account:user:${userId}`, RULES.accountActionPerUser);
  if (!limited.allowed) {
    return NextResponse.json({ error: tooManyRequestsMessage(limited) }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      termsAcceptedAt: true,
      termsVersion: true,
      privacyVersion: true,
      attempts: {
        select: { createdAt: true, mode: true, correct: true, signal: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
      sessions: {
        select: { createdAt: true, completedAt: true, mode: true, category: true, totalCount: true, correctCount: true },
        orderBy: { createdAt: "asc" },
      },
      drillResults: {
        select: { createdAt: true, drill: true, item: true, score: true, total: true, mistakes: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = {
    exportedAt: new Date().toISOString(),
    note: "All personal data Surf Signals holds about you. Your password is stored only as a one-way hash and isn't included.",
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      termsAcceptedAt: user.termsAcceptedAt,
      termsVersion: user.termsVersion,
      privacyVersion: user.privacyVersion,
    },
    practiceResults: user.attempts.map((a) => ({
      at: a.createdAt,
      signal: a.signal.name,
      mode: a.mode,
      correct: a.correct,
    })),
    studySessions: user.sessions,
    testResults: user.drillResults.map(({ createdAt, ...r }) => ({ at: createdAt, ...r })),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="surf-signals-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

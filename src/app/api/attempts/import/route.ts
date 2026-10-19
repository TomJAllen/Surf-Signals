import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

const MAX_IMPORT = 100; // matches the cap kept in localStorage

interface IncomingAttempt {
  signalId?: unknown;
  mode?: unknown;
  correct?: unknown;
  createdAt?: unknown;
}

// Imports attempts a guest made in this browser into their account.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limited = await rateLimit(`account:user:${session.user.id}`, RULES.accountActionPerUser);
    if (!limited.allowed) {
      return NextResponse.json({ error: tooManyRequestsMessage(limited) }, { status: 429 });
    }

    const body = await request.json();
    const incoming: IncomingAttempt[] = Array.isArray(body?.attempts)
      ? body.attempts.slice(-MAX_IMPORT)
      : [];

    if (incoming.length === 0) {
      return NextResponse.json({ imported: 0 });
    }

    // Only accept attempts for signals that actually exist
    const signalIds = Array.from(
      new Set(incoming.map((a) => a.signalId).filter((id): id is string => typeof id === "string"))
    );
    const known = new Set(
      (
        await prisma.signal.findMany({
          where: { id: { in: signalIds } },
          select: { id: true },
        })
      ).map((s) => s.id)
    );

    const now = Date.now();
    const data = incoming
      .filter(
        (a) =>
          typeof a.signalId === "string" &&
          known.has(a.signalId) &&
          (a.mode === "identify" || a.mode === "perform") &&
          typeof a.correct === "boolean"
      )
      .map((a) => {
        const parsed = typeof a.createdAt === "string" ? Date.parse(a.createdAt) : NaN;
        // Reject future or unparseable timestamps
        const createdAt = Number.isFinite(parsed) && parsed <= now ? new Date(parsed) : new Date();
        return {
          userId: session.user.id,
          signalId: a.signalId as string,
          mode: a.mode as string,
          correct: a.correct as boolean,
          createdAt,
        };
      });

    if (data.length > 0) {
      await prisma.attempt.createMany({ data });
    }

    return NextResponse.json({ imported: data.length });
  } catch (error) {
    console.error("Error importing attempts:", error);
    return NextResponse.json({ error: "Failed to import attempts" }, { status: 500 });
  }
}

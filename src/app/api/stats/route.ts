import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Return empty stats for anonymous users (they use localStorage)
  if (!session?.user?.id) {
    return NextResponse.json({
      overall: { totalAttempts: 0, correctAttempts: 0, accuracy: 0 },
      byMode: {
        identify: { totalAttempts: 0, correctAttempts: 0, accuracy: 0 },
        perform: { totalAttempts: 0, correctAttempts: 0, accuracy: 0 },
      },
      recentAttempts: [],
      signalStats: [],
    });
  }

  try {
    const userId = session.user.id;

    type Stats = { totalAttempts: number; correctAttempts: number; accuracy: number };
    const toStats = (total: number, correct: number): Stats => ({
      totalAttempts: total,
      correctAttempts: correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    });

    // Aggregate in the database rather than loading every attempt into memory
    const [grouped, recentAttempts, signals] = await Promise.all([
      prisma.attempt.groupBy({
        by: ["signalId", "mode", "correct"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.attempt.findMany({
        where: { userId },
        include: { signal: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.signal.findMany({
        select: { id: true, name: true, description: true, imageUrl: true, category: true },
      }),
    ]);

    const totals = { all: [0, 0], identify: [0, 0], perform: [0, 0] } as Record<string, [number, number]>;
    const bySignal = new Map<string, [number, number]>();

    for (const row of grouped) {
      const n = row._count._all;
      const c = row.correct ? n : 0;
      for (const key of ["all", row.mode]) {
        if (!totals[key]) continue;
        totals[key][0] += n;
        totals[key][1] += c;
      }
      const s = bySignal.get(row.signalId) ?? [0, 0];
      s[0] += n;
      s[1] += c;
      bySignal.set(row.signalId, s);
    }

    const signalStats = signals.map((signal) => {
      const [total, correct] = bySignal.get(signal.id) ?? [0, 0];
      return { ...signal, stats: toStats(total, correct) };
    });

    return NextResponse.json({
      overall: toStats(...totals.all),
      byMode: {
        identify: toStats(...totals.identify),
        perform: toStats(...totals.perform),
      },
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        signalName: a.signal.name,
        mode: a.mode,
        correct: a.correct,
        createdAt: a.createdAt.toISOString(),
      })),
      signalStats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

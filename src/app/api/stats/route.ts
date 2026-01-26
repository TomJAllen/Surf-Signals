import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    // Get overall stats
    const overallAttempts = await prisma.attempt.findMany({
      where: { userId },
    });

    const identifyAttempts = overallAttempts.filter((a) => a.mode === "identify");
    const performAttempts = overallAttempts.filter((a) => a.mode === "perform");

    const calculateStats = (attempts: typeof overallAttempts) => {
      const total = attempts.length;
      const correct = attempts.filter((a) => a.correct).length;
      return {
        totalAttempts: total,
        correctAttempts: correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    };

    // Get recent attempts with signal names
    const recentAttempts = await prisma.attempt.findMany({
      where: { userId },
      include: {
        signal: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get per-signal stats
    const signalsWithStats = await prisma.signal.findMany({
      include: {
        attempts: {
          where: { userId },
        },
      },
    });

    const signalStats = signalsWithStats.map((signal) => ({
      id: signal.id,
      name: signal.name,
      description: signal.description,
      imageUrl: signal.imageUrl,
      category: signal.category,
      stats: calculateStats(signal.attempts),
    }));

    return NextResponse.json({
      overall: calculateStats(overallAttempts),
      byMode: {
        identify: calculateStats(identifyAttempts),
        perform: calculateStats(performAttempts),
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

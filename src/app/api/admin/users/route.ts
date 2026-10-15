import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [users, grouped] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.attempt.groupBy({
        by: ["userId", "correct"],
        where: { userId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const counts = new Map<string, { total: number; correct: number }>();
    for (const row of grouped) {
      if (!row.userId) continue;
      const c = counts.get(row.userId) ?? { total: 0, correct: 0 };
      c.total += row._count._all;
      if (row.correct) c.correct += row._count._all;
      counts.set(row.userId, c);
    }

    const result = users.map((user) => {
      const { total, correct } = counts.get(user.id) ?? { total: 0, correct: 0 };
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        totalAttempts: total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

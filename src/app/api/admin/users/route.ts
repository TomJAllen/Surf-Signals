import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const users = await prisma.user.findMany({
      include: {
        attempts: {
          select: { correct: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = users.map((user) => {
      const total = user.attempts.length;
      const correct = user.attempts.filter((a) => a.correct).length;
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

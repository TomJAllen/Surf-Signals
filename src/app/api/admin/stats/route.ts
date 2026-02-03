import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const [userCount, signalCount, attemptCount] = await Promise.all([
      prisma.user.count(),
      prisma.signal.count(),
      prisma.attempt.count(),
    ]);

    return NextResponse.json({ userCount, signalCount, attemptCount });
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

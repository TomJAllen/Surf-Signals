import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Allow anonymous attempts - userId will be null
  const userId = session?.user?.id || null;

  try {
    const { signalId, mode, correct } = await request.json();

    if (!signalId || !mode || typeof correct !== "boolean") {
      return NextResponse.json(
        { error: "signalId, mode, and correct are required" },
        { status: 400 }
      );
    }

    if (mode !== "identify" && mode !== "perform") {
      return NextResponse.json(
        { error: "Mode must be 'identify' or 'perform'" },
        { status: 400 }
      );
    }

    // Only save to database if user is authenticated
    // Anonymous attempts are handled client-side via localStorage
    if (userId) {
      const attempt = await prisma.attempt.create({
        data: {
          userId,
          signalId,
          mode,
          correct,
        },
      });
      return NextResponse.json(attempt);
    }

    // Return success for anonymous users (they store locally)
    return NextResponse.json({ success: true, anonymous: true });
  } catch (error) {
    console.error("Error creating attempt:", error);
    return NextResponse.json(
      { error: "Failed to record attempt" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // Return empty array for anonymous users (they use localStorage)
    return NextResponse.json([]);
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const attempts = await prisma.attempt.findMany({
      where: { userId: session.user.id },
      include: {
        signal: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("Error fetching attempts:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempts" },
      { status: 500 }
    );
  }
}

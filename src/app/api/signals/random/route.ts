import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const count = await prisma.signal.count();

    if (count === 0) {
      return NextResponse.json(
        { error: "No signals found" },
        { status: 404 }
      );
    }

    const randomSkip = Math.floor(Math.random() * count);

    const signal = await prisma.signal.findFirst({
      skip: randomSkip,
    });

    return NextResponse.json(signal);
  } catch (error) {
    console.error("Error fetching random signal:", error);
    return NextResponse.json(
      { error: "Failed to fetch random signal" },
      { status: 500 }
    );
  }
}

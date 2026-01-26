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
    const signals = await prisma.signal.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(signals);
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, imageUrl, category } = await request.json();

    if (!name || !description || !imageUrl) {
      return NextResponse.json(
        { error: "Name, description, and imageUrl are required" },
        { status: 400 }
      );
    }

    const signal = await prisma.signal.create({
      data: {
        name,
        description,
        imageUrl,
        category,
      },
    });

    return NextResponse.json(signal);
  } catch (error) {
    console.error("Error creating signal:", error);
    return NextResponse.json(
      { error: "Failed to create signal" },
      { status: 500 }
    );
  }
}

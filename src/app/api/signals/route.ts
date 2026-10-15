import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { shuffle } from "@/lib/shuffle";
import { clampLimit } from "@/lib/validation";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  // Allow anonymous access to signals list for practicing
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = clampLimit(searchParams.get("limit"), MAX_LIMIT, MAX_LIMIT);
    const wantShuffle = searchParams.get("shuffle") === "true";

    const signals = await prisma.signal.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: "asc" },
      // When shuffling, fetch the full (small) set first so the sample is random
      // rather than the first N alphabetically.
      take: wantShuffle ? undefined : limit,
    });

    return NextResponse.json(wantShuffle ? shuffle(signals).slice(0, limit) : signals);
  } catch (error) {
    console.error("Error fetching signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { name, description, imageUrl, category } = await request.json();

    if (!name || !description || !imageUrl) {
      return NextResponse.json(
        { error: "Name, description, and imageUrl are required" },
        { status: 400 }
      );
    }

    if (category && category !== "beach-to-water" && category !== "water-to-beach") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const signal = await prisma.signal.create({
      data: { name, description, imageUrl, category },
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

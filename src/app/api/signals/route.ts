import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllSignals, signalsChanged } from "@/lib/signalList";
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

    // The full (small) set comes from the cache; filter and sample here
    const all = await getAllSignals();
    const matching = category ? all.filter((s) => s.category === category) : all;
    const signals = wantShuffle ? matching : matching.slice(0, limit);

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

    signalsChanged();
    return NextResponse.json(signal);
  } catch (error) {
    console.error("Error creating signal:", error);
    return NextResponse.json(
      { error: "Failed to create signal" },
      { status: 500 }
    );
  }
}

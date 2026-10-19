import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { poseHint } = body;

    const signal = await prisma.signal.update({
      where: { id },
      data: { poseHint: poseHint || null },
    });

    return NextResponse.json(signal);
  } catch (err) {
    console.error("Error updating signal:", err);
    return NextResponse.json(
      { error: "Failed to update signal" },
      { status: 500 }
    );
  }
}

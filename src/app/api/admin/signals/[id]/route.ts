import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { signalsChanged } from "@/lib/signalList";

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
    if (poseHint != null && (typeof poseHint !== "string" || poseHint.length > 300)) {
      return NextResponse.json({ error: "Pose hint must be text of 300 characters or fewer" }, { status: 400 });
    }

    const signal = await prisma.signal.update({
      where: { id },
      data: { poseHint: poseHint?.trim() || null },
    });

    signalsChanged();
    return NextResponse.json(signal);
  } catch (err) {
    console.error("Error updating signal:", err);
    return NextResponse.json(
      { error: "Failed to update signal" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";

// Invalidates every existing session for this user, on all devices
export async function POST() {
  const { error, session } = await requireUser();
  if (error) return error;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { sessionVersion: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}

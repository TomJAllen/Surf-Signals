import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createResetToken, RESET_LINK_TTL_SECONDS } from "@/lib/passwordReset";
import { rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

// Admin only: creates a one-time password reset link for a user, valid for an hour.
// The admin sends it to the user themselves. Nothing is stored or emailed.
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const limited = await rateLimit(`reset-link:admin:${session.user.id}`, RULES.accountActionPerUser);
  if (!limited.allowed) {
    return NextResponse.json({ error: tooManyRequestsMessage(limited) }, { status: 429 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, passwordHash: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const secret = process.env.NEXTAUTH_SECRET;
  const base = process.env.NEXTAUTH_URL;
  if (!secret || !base) {
    return NextResponse.json({ error: "NEXTAUTH_SECRET and NEXTAUTH_URL must be set" }, { status: 500 });
  }

  const token = createResetToken(user.id, user.passwordHash, secret);
  const url = `${base.replace(/\/$/, "")}/reset-password#${token}`;
  return NextResponse.json({ url, expiresInMinutes: RESET_LINK_TTL_SECONDS / 60 });
}

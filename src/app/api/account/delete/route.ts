import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";
import { forgetAccount } from "@/lib/sessionCheck";
import { rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

// Permanently deletes the signed-in user's account and all their data.
// Requires the current password so a stolen session alone can't do it.
export async function POST(request: Request) {
  const { error, session } = await requireUser();
  if (error) return error;
  const userId = session.user.id;

  const limited = await rateLimit(`account:user:${userId}`, RULES.accountActionPerUser);
  if (!limited.allowed) {
    return NextResponse.json({ error: tooManyRequestsMessage(limited) }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  if (typeof body?.password !== "string" || body.password.length > 200) {
    return NextResponse.json({ error: "Please enter your password" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "That password isn't right" }, { status: 403 });
  }

  // Attempts and study sessions are removed by ON DELETE CASCADE
  await prisma.user.delete({ where: { id: userId } });
  forgetAccount(userId);
  return NextResponse.json({ deleted: true });
}

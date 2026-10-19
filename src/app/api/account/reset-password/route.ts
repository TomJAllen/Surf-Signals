import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";
import { isResetTokenValid, parseResetToken } from "@/lib/passwordReset";
import { clientIp, rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

const INVALID = "This reset link is invalid or has expired. Ask for a new one.";

// Sets a new password using a one-time reset link, then signs the user out everywhere
export async function POST(request: Request) {
  const limited = await rateLimit(`reset:ip:${clientIp(request.headers)}`, RULES.passwordResetPerIp);
  if (!limited.allowed) {
    return NextResponse.json({ error: tooManyRequestsMessage(limited) }, { status: 429 });
  }

  let body: { token?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = body.password;
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 400 });
  }
  if (password.length > 200) {
    return NextResponse.json({ error: "Password is too long" }, { status: 400 });
  }

  const parsed = parseResetToken(body.token);
  if (!parsed) return NextResponse.json({ error: INVALID }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: parsed.userId },
    select: { id: true, passwordHash: true },
  });
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  if (!user || !isResetTokenValid(parsed, user.passwordHash, secret)) {
    return NextResponse.json({ error: INVALID }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  // Only succeeds if the password hasn't changed since the link was checked,
  // so the same link can't be used twice even by two requests at once
  const updated = await prisma.user.updateMany({
    where: { id: user.id, passwordHash: user.passwordHash },
    data: { passwordHash, sessionVersion: { increment: 1 } },
  });
  if (updated.count !== 1) return NextResponse.json({ error: INVALID }, { status: 400 });

  return NextResponse.json({ ok: true });
}

import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken, RESET_LINK_TTL_SECONDS } from "@/lib/passwordReset";
import { emailEnabled, resetEmail, sendEmail } from "@/lib/email";
import { clientIp, rateLimit, RULES, tooManyRequestsMessage } from "@/lib/rateLimit";

// "Forgot your password?": emails a one-time reset link if the address has an
// account. The reply is the same either way, and the email is sent after the
// response, so neither the message nor the timing reveals who has an account.
export async function POST(request: Request) {
  if (!emailEnabled()) {
    return NextResponse.json({ error: "Password reset emails aren't set up yet" }, { status: 503 });
  }

  const byIp = await rateLimit(`forgot:ip:${clientIp(request.headers)}`, RULES.forgotPasswordPerIp);
  if (!byIp.allowed) return NextResponse.json({ error: tooManyRequestsMessage(byIp) }, { status: 429 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  after(async () => {
    // Quietly limit per address too, so nobody can flood someone's inbox
    const byEmail = await rateLimit(`forgot:email:${email}`, RULES.forgotPasswordPerEmail);
    if (!byEmail.allowed) return;
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, email: true, passwordHash: true },
    });
    const secret = process.env.NEXTAUTH_SECRET;
    const base = process.env.NEXTAUTH_URL;
    if (!user || !secret || !base) return;
    const link = `${base.replace(/\/$/, "")}/reset-password#${createResetToken(user.id, user.passwordHash, secret)}`;
    await sendEmail(resetEmail(user.email, link, RESET_LINK_TTL_SECONDS / 60));
  });

  return NextResponse.json({ ok: true });
}

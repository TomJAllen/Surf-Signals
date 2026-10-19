import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/admin";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/content/legal";

// Records that the signed-in user accepted the current Terms and Privacy Policy
export async function POST(request: Request) {
  const { error, session } = await requireUser();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  if (body?.acceptTerms !== true || body?.confirmAge !== true) {
    return NextResponse.json({ error: "Please tick both boxes to continue" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION },
  });
  return NextResponse.json({ termsVersion: TERMS_VERSION });
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Admins must BOTH have role "admin" in the database AND have their email in the
// ADMIN_EMAILS environment variable (comma-separated). So a database mistake or a
// tampered row can't create an admin, and removing an email locks it out at once.
// In production, if ADMIN_EMAILS is unset, nobody is an admin (fail closed).
export function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAllowedAdmin(
  user: { email: string; role: string } | null,
  allowlistRaw: string | undefined,
  isProduction: boolean
): boolean {
  if (!user || user.role !== "admin") return false;
  const allowlist = parseAdminEmails(allowlistRaw);
  if (allowlist.size === 0) return !isProduction; // dev convenience only
  return allowlist.has(user.email.toLowerCase());
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  // Re-check against the database on every admin request; the session token
  // alone isn't trusted for admin rights.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, role: true },
  });

  if (!isAllowedAdmin(user, process.env.ADMIN_EMAILS, process.env.NODE_ENV === "production")) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }

  return { error: null, session };
}

// For routes that need a signed-in user who still exists
export async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

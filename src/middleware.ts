import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";

// Defence in depth for the admin area: the pages don't even render for
// non-admins. (Every admin API route also re-checks the role and the
// ADMIN_EMAILS allowlist against the database.)
const adminGuard = withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "admin",
  },
  pages: { signIn: "/login" },
});

// The live site is reachable on Vercel's extra *.vercel.app aliases too. Send
// those visitors to the main address so sign-in (tied to NEXTAUTH_URL) works.
// Production only, so preview links for pull requests keep working.
export function canonicalRedirect(req: NextRequest): NextResponse | null {
  if (process.env.VERCEL_ENV !== "production" || !process.env.NEXTAUTH_URL) return null;
  let canonical: URL;
  try {
    canonical = new URL(process.env.NEXTAUTH_URL);
  } catch {
    return null;
  }
  const host = req.headers.get("host") ?? req.nextUrl.host;
  if (host === canonical.host || !host.endsWith(".vercel.app")) return null;
  const url = new URL(req.nextUrl.pathname + req.nextUrl.search, canonical);
  return NextResponse.redirect(url, 308);
}

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const redirect = canonicalRedirect(req);
  if (redirect) return redirect;
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return adminGuard(req as NextRequestWithAuth, event);
  }
  return NextResponse.next();
}

export const config = {
  // Pages only: not API routes, the analytics proxy, or static files
  matcher: ["/((?!api/|ingest/|_next/|mediapipe/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml|webmanifest|js|css|wasm|task)$).*)"],
};

import { withAuth } from "next-auth/middleware";

// Defence in depth for the admin area: the pages don't even render for
// non-admins. (Every admin API route also re-checks the role and the
// ADMIN_EMAILS allowlist against the database.)
export default withAuth({
  callbacks: {
    authorized: ({ token }) => token?.role === "admin",
  },
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/admin/:path*"],
};

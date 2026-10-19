import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { checkAccount } from "./sessionCheck";
import { clientIp, rateLimit, RULES, tooManyRequestsMessage } from "./rateLimit";

// Compared against when the email doesn't exist, so a missing account takes as long
// as a wrong password and response times don't reveal which emails are registered.
const DUMMY_HASH = "$2b$12$fyeVop1Ucvne5IOGfcZ4deJFv3R/cz5m7RigjGDhfojk6CsOs4qmS";

// Every request re-checks the session against the database (a single primary-key
// lookup, shared for a few seconds; see sessionCheck.ts), so role changes, deleted
// accounts and "sign out everywhere" apply within seconds.

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        const email = credentials.email.trim().toLowerCase();
        if (email.length > 254 || credentials.password.length > 200) {
          throw new Error("Invalid email or password");
        }

        const ip = clientIp(req?.headers ?? {});
        const [byEmail, byIp] = await Promise.all([
          rateLimit(`login:email:${email}`, RULES.loginPerEmail),
          rateLimit(`login:ip:${ip}`, RULES.loginPerIp),
        ]);
        const blocked = !byEmail.allowed ? byEmail : !byIp.allowed ? byIp : null;
        if (blocked) throw new Error(tooManyRequestsMessage(blocked));

        // Case-insensitive so accounts created before emails were lowercased still work
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });

        const isPasswordValid = await bcrypt.compare(credentials.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          termsVersion: user.termsVersion,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 14 * 24 * 60 * 60, // 14 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const u = user as unknown as { id: string; role: string; termsVersion: string | null; sessionVersion: number };
        token.id = u.id;
        token.role = u.role;
        token.termsVersion = u.termsVersion;
        token.sv = u.sessionVersion;
        token.checkedAt = Date.now();
        return token;
      }

      if (!token.id) return token;

      // A session refresh (e.g. after accepting terms) always reads fresh
      const current = await checkAccount(
        token.id,
        (id) =>
          prisma.user.findUnique({
            where: { id },
            select: { role: true, termsVersion: true, sessionVersion: true, name: true, email: true },
          }),
        { fresh: trigger === "update" }
      );

      // Deleted account, or signed out everywhere: drop the identity from the token
      if (!current || current.sessionVersion !== (token.sv ?? 0)) {
        return { exp: token.exp, iat: token.iat, jti: token.jti };
      }

      token.role = current.role;
      token.termsVersion = current.termsVersion;
      token.name = current.name;
      token.email = current.email;
      token.checkedAt = Date.now();
      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        // Token no longer valid: present as signed out
        return { expires: session.expires } as typeof session;
      }
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role ?? "user";
        session.user.termsVersion = token.termsVersion ?? null;
      }
      return session;
    },
  },
};

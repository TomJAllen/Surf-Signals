import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      termsVersion: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    termsVersion?: string | null;
    sv?: number; // sessionVersion at sign-in
    checkedAt?: number; // when we last re-validated against the database
  }
}

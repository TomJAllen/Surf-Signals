"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import LocalProgressSync from "./LocalProgressSync";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      <LocalProgressSync />
      {children}
    </NextAuthSessionProvider>
  );
}

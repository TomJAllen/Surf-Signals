"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import Link from "next/link";

// Pages that allow anonymous access
const ANONYMOUS_ALLOWED_PATHS = ["/study/identify", "/study/perform"];

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isAnonymousAllowed = ANONYMOUS_ALLOWED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-slsa-subtle">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login for protected pages if not authenticated
  if (!session && !isAnonymousAllowed) {
    return (
      <div className="min-h-screen gradient-slsa-subtle flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to sign in to access your dashboard and history. You can still practice signals without an account.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 px-6 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Create Account
            </Link>
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-sm text-gray-500">or</span>
              </div>
            </div>
            <Link
              href="/study/identify"
              className="block w-full py-3 px-6 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all"
            >
              Practice Without Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

      {/* Prompt to create account for anonymous users */}
      {!session && isAnonymousAllowed && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Want to save your progress?</span>
            </p>
            <Link
              href="/signup"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-all whitespace-nowrap"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

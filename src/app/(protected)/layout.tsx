"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import TermsGate from "@/components/TermsGate";
import Link from "next/link";

// Pages that allow anonymous access
const ANONYMOUS_ALLOWED_PATHS = ["/learn", "/test", "/study/identify", "/study/perform"];
const BANNER_KEY = "ss-guest-banner-dismissed";
// Everything else under this layout (dashboard, history, account) is personal, so needs sign-in

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

  // Guests can hide the "create an account" prompt; remembered in this browser only
  const [bannerDismissed, setBannerDismissed] = useState(true);
  useEffect(() => {
    try {
      setBannerDismissed(localStorage.getItem(BANNER_KEY) === "1");
    } catch {
      setBannerDismissed(false);
    }
  }, []);
  const dismissBanner = () => {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };
  const showBanner = !session && isAnonymousAllowed && !bannerDismissed;

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
            You need to sign in to see your dashboard, history and account. Everything else works without an account.
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
              href="/test"
              className="block w-full py-3 px-6 bg-secondary text-gray-900 rounded-xl font-bold hover:bg-secondary-light transition-all"
            >
              Test yourself without an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className={`max-w-6xl mx-auto px-4 py-8 ${showBanner ? "pb-32" : ""}`}>{children}</main>
      <TermsGate />

      {/* Prompt to create an account, for guests */}
      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
          <div
            role="region"
            aria-label="Create an account"
            className="pointer-events-auto max-w-xl mx-auto flex items-center gap-3 bg-sand border-[3px] border-ink shadow-[4px_4px_0_#1C1917] rounded-lg py-2.5 pl-4 pr-2"
          >
            <p className="flex-1 text-sm text-ink leading-snug">
              <span className="font-semibold">Practising as a guest.</span>{" "}
              <span className="hidden sm:inline">Create a free account to save your progress.</span>
              <span className="sm:hidden">Save your progress with a free account.</span>
            </p>
            <Link
              href="/signup"
              className="btn-primary shrink-0 py-2 px-4 text-lg whitespace-nowrap"
            >
              Sign up
            </Link>
            <button
              onClick={dismissBanner}
              aria-label="Hide this message"
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md text-stone-600 hover:text-ink hover:bg-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

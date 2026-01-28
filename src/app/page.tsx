"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary to-primary-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary-dark to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-16 safe-top">
        {/* Hero Section */}
        <div className="text-center text-white">
          <div className="inline-block mb-6">
            <span className="bg-secondary text-gray-900 px-4 py-2 rounded-lg text-lg font-black tracking-wide">
              SURF LIFE SAVING AUSTRALIA
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Surf Signals
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
            Master surf lifesaving signals with interactive flashcard training.
            Learn to identify signals and practice performing them correctly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-secondary text-gray-900 rounded-xl font-bold text-lg hover:bg-secondary-light transition-all active:scale-95 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white border border-white/10 hover:border-secondary/50 transition-colors">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-7 h-7 text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Identify Mode</h3>
            <p className="text-white/70">
              See a signal image and test your knowledge by identifying it
              correctly.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white border border-white/10 hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Perform Mode</h3>
            <p className="text-white/70">
              Practice performing signals physically and compare with reference
              images.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white border border-white/10 hover:border-secondary/50 transition-colors">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-5">
              <svg
                className="w-7 h-7 text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Track Progress</h3>
            <p className="text-white/70">
              Monitor your accuracy and improvement over time with detailed
              statistics.
            </p>
          </div>
        </div>

        {/* Categories Preview */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            Learn All Signal Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-6 py-3 bg-blue-500/20 text-blue-200 rounded-full font-medium border border-blue-400/30">
              Water Signals
            </span>
            <span className="px-6 py-3 bg-green-500/20 text-green-200 rounded-full font-medium border border-green-400/30">
              Land Signals
            </span>
            <span className="px-6 py-3 bg-orange-500/20 text-orange-200 rounded-full font-medium border border-orange-400/30">
              IRB Signals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

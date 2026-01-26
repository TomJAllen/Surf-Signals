"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import type { DashboardStats, SignalWithStats } from "@/types";

interface StatsResponse extends DashboardStats {
  signalStats: SignalWithStats[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/study/identify"
          className="group card-highlight hover:shadow-lg transition-all hover:border-secondary"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Identify Mode
              </h3>
              <p className="text-gray-600">
                Practice identifying signals from images
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/study/perform"
          className="group card-highlight hover:shadow-lg transition-all hover:border-accent"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Perform Mode
              </h3>
              <p className="text-gray-600">
                Practice performing signals and check your form
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Overall Stats */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Overall Progress
        </h2>

        {stats && stats.overall.totalAttempts > 0 ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.overall.totalAttempts}
                </div>
                <div className="text-gray-600 text-sm font-medium">Total Attempts</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="text-3xl font-bold text-success-dark">
                  {stats.overall.correctAttempts}
                </div>
                <div className="text-gray-600 text-sm font-medium">Correct</div>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-xl border border-accent/20">
                <div className="text-3xl font-bold text-accent-dark">
                  {stats.overall.accuracy}%
                </div>
                <div className="text-gray-600 text-sm font-medium">Accuracy</div>
              </div>
            </div>

            <ProgressBar
              value={stats.overall.accuracy}
              label="Overall Accuracy"
              color={stats.overall.accuracy >= 80 ? "green" : stats.overall.accuracy >= 50 ? "yellow" : "red"}
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">
              No attempts yet. Start practicing to see your progress!
            </p>
          </div>
        )}
      </div>

      {/* Stats by Mode */}
      {stats && stats.overall.totalAttempts > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Identify Mode
              </h3>
            </div>
            {stats.byMode.identify.totalAttempts > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attempts</span>
                  <span className="font-bold text-gray-900">
                    {stats.byMode.identify.totalAttempts}
                  </span>
                </div>
                <ProgressBar
                  value={stats.byMode.identify.accuracy}
                  label="Accuracy"
                  size="sm"
                />
              </div>
            ) : (
              <p className="text-gray-500">No attempts in this mode yet.</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Perform Mode
              </h3>
            </div>
            {stats.byMode.perform.totalAttempts > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attempts</span>
                  <span className="font-bold text-gray-900">
                    {stats.byMode.perform.totalAttempts}
                  </span>
                </div>
                <ProgressBar
                  value={stats.byMode.perform.accuracy}
                  label="Accuracy"
                  size="sm"
                />
              </div>
            ) : (
              <p className="text-gray-500">No attempts in this mode yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {stats && stats.recentAttempts.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Activity
            </h2>
            <Link
              href="/history"
              className="text-primary hover:text-primary-dark text-sm font-semibold"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentAttempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <span className="font-semibold text-gray-900">
                    {attempt.signalName}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 capitalize bg-gray-200 px-2 py-0.5 rounded-full">
                    {attempt.mode}
                  </span>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                    attempt.correct
                      ? "bg-success/20 text-success-dark"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {attempt.correct ? "Correct" : "Incorrect"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-Signal Stats */}
      {stats && stats.signalStats && stats.signalStats.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Performance by Signal
          </h2>

          <div className="space-y-4">
            {stats.signalStats
              .filter((s) => s.stats.totalAttempts > 0)
              .sort((a, b) => a.stats.accuracy - b.stats.accuracy)
              .map((signal) => (
                <div key={signal.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{signal.name}</span>
                    <span className="text-gray-500 font-medium">
                      {signal.stats.correctAttempts}/{signal.stats.totalAttempts}
                    </span>
                  </div>
                  <ProgressBar
                    value={signal.stats.accuracy}
                    showPercentage={false}
                    size="sm"
                    color={
                      signal.stats.accuracy >= 80
                        ? "green"
                        : signal.stats.accuracy >= 50
                        ? "yellow"
                        : "red"
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

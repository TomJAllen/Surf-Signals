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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Identify Mode
          </h3>
          <p className="text-gray-600">
            Practice identifying signals from images
          </p>
        </Link>

        <Link
          href="/study/perform"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Perform Mode
          </h3>
          <p className="text-gray-600">
            Practice performing signals and check your form
          </p>
        </Link>
      </div>

      {/* Overall Stats */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Overall Progress
        </h2>

        {stats && stats.overall.totalAttempts > 0 ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {stats.overall.totalAttempts}
                </div>
                <div className="text-gray-600">Total Attempts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {stats.overall.correctAttempts}
                </div>
                <div className="text-gray-600">Correct</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {stats.overall.accuracy}%
                </div>
                <div className="text-gray-600">Accuracy</div>
              </div>
            </div>

            <ProgressBar
              value={stats.overall.accuracy}
              label="Overall Accuracy"
              color={stats.overall.accuracy >= 80 ? "green" : stats.overall.accuracy >= 50 ? "yellow" : "red"}
            />
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No attempts yet. Start practicing to see your progress!
          </p>
        )}
      </div>

      {/* Stats by Mode */}
      {stats && stats.overall.totalAttempts > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Identify Mode
            </h3>
            {stats.byMode.identify.totalAttempts > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attempts</span>
                  <span className="font-medium">
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Perform Mode
            </h3>
            {stats.byMode.perform.totalAttempts > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attempts</span>
                  <span className="font-medium">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Activity
            </h2>
            <Link
              href="/history"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentAttempts.slice(0, 5).map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <span className="font-medium text-gray-800">
                    {attempt.signalName}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 capitalize">
                    ({attempt.mode})
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    attempt.correct
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Performance by Signal
          </h2>

          <div className="space-y-4">
            {stats.signalStats
              .filter((s) => s.stats.totalAttempts > 0)
              .sort((a, b) => a.stats.accuracy - b.stats.accuracy)
              .map((signal) => (
                <div key={signal.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{signal.name}</span>
                    <span className="text-gray-500">
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

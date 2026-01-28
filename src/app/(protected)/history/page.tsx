"use client";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import type { RecentAttempt, StudyMode, DashboardStats, SignalWithStats } from "@/types";

interface Attempt extends RecentAttempt {
  signal?: {
    name: string;
  };
}

interface StatsResponse extends DashboardStats {
  signalStats: SignalWithStats[];
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | StudyMode>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const [attemptsRes, statsRes] = await Promise.all([
          fetch("/api/attempts?limit=100"),
          fetch("/api/stats"),
        ]);

        if (attemptsRes.ok) {
          const data = await attemptsRes.json();
          setAttempts(
            data.map((a: Attempt & { signal?: { name: string } }) => ({
              ...a,
              signalName: a.signal?.name || "Unknown",
            }))
          );
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredAttempts =
    filter === "all"
      ? attempts
      : attempts.filter((a) => a.mode === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">History</h1>

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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
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

      {/* Performance by Signal */}
      {stats && stats.signalStats && stats.signalStats.filter((s) => s.stats.totalAttempts > 0).length > 0 && (
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

      {/* Attempts List */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">All Attempts</h2>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("identify")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                filter === "identify"
                  ? "bg-secondary text-gray-900"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Identify
            </button>
            <button
              onClick={() => setFilter("perform")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                filter === "perform"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Perform
            </button>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              {filter === "all"
                ? "No attempts yet. Start practicing to see your history!"
                : `No ${filter} attempts yet.`}
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-gray-100">
              {filteredAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-4 h-4 rounded-full ${
                        attempt.correct ? "bg-secondary" : "bg-primary"
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {attempt.signalName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(attempt.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${
                      attempt.mode === "identify"
                        ? "bg-secondary/20 text-secondary-dark"
                        : "bg-primary/20 text-primary-dark"
                    }`}>
                      {attempt.mode}
                    </span>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                        attempt.correct
                          ? "bg-secondary/20 text-secondary-dark"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {attempt.correct ? "Correct" : "Incorrect"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

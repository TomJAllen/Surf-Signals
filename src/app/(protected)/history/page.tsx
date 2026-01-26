"use client";

import { useEffect, useState } from "react";
import type { RecentAttempt, StudyMode } from "@/types";

interface Attempt extends RecentAttempt {
  signal?: {
    name: string;
  };
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | StudyMode>("all");

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const response = await fetch("/api/attempts?limit=100");
        if (response.ok) {
          const data = await response.json();
          setAttempts(
            data.map((a: Attempt & { signal?: { name: string } }) => ({
              ...a,
              signalName: a.signal?.name || "Unknown",
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAttempts();
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">History</h1>

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
                ? "bg-accent text-white"
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
                      attempt.correct ? "bg-success" : "bg-primary"
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
                      : "bg-accent/20 text-accent-dark"
                  }`}>
                    {attempt.mode}
                  </span>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

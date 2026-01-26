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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">History</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("identify")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "identify"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Identify
          </button>
          <button
            onClick={() => setFilter("perform")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "perform"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Perform
          </button>
        </div>
      </div>

      {filteredAttempts.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">
            {filter === "all"
              ? "No attempts yet. Start practicing to see your history!"
              : `No ${filter} attempts yet.`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      attempt.correct ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {attempt.signalName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(attempt.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 capitalize">
                    {attempt.mode}
                  </span>
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

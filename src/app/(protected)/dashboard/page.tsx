"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { DashboardStats } from "@/types";
import { TOPICS } from "@/content/topics";

interface SignalStat {
  id: string;
  name: string;
  stats: { totalAttempts: number; correctAttempts: number; accuracy: number };
}

type StatsResponse = DashboardStats & { signalStats?: SignalStat[] };

// Signals to practise next: weakest first, then ones never tried
function practiseNext(signals: SignalStat[] = [], count = 3): SignalStat[] {
  const tried = signals
    .filter((s) => s.stats.totalAttempts > 0 && s.stats.accuracy < 100)
    .sort((a, b) => a.stats.accuracy - b.stats.accuracy || b.stats.totalAttempts - a.stats.totalAttempts);
  const untried = signals.filter((s) => s.stats.totalAttempts === 0);
  return [...tried, ...untried].slice(0, count);
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-gray-600 text-sm font-medium">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch((error) => console.error("Failed to fetch stats:", error))
      .finally(() => setLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(" ")[0];
  const hasAttempts = !!stats && stats.overall.totalAttempts > 0;
  const next = practiseNext(stats?.signalStats);

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">{firstName ? `G'day, ${firstName}` : "Dashboard"}</h1>
        <p className="text-gray-600">Learn it, then practise it. Pick a topic to get going.</p>
      </header>

      {/* Topics: Learn + Practice for each */}
      <section className="grid md:grid-cols-3 gap-4">
        {TOPICS.map((t) => {
          const ready = t.exercises.filter((e) => e.href).length;
          const soon = t.exercises.length - ready;
          return (
            <div key={t.id} className="card flex flex-col gap-3">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
                <p className="text-gray-600 text-sm">{t.blurb}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {ready} exercise{ready === 1 ? "" : "s"}
                  {soon > 0 && ` · ${soon} coming soon`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={t.learnHref} className="flex-1 text-center py-2.5 rounded-xl font-bold bg-gray-100 text-gray-800 hover:bg-gray-200">
                  Learn
                </Link>
                <Link href={`/practice#${t.id}`} className="flex-1 text-center py-2.5 rounded-xl font-bold bg-secondary text-gray-900 hover:bg-secondary-light">
                  Practise
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      {/* Progress */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your signals progress</h2>
        {loading ? (
          <div className="card flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : hasAttempts ? (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card space-y-4">
              <div className="flex flex-wrap gap-8">
                <Stat value={stats!.overall.totalAttempts} label="Attempts" />
                <Stat value={`${stats!.overall.accuracy}%`} label="Accuracy" />
              </div>
              <div className="flex flex-wrap gap-8 pt-4 border-t border-gray-100">
                <Stat value={`${stats!.byMode.identify.accuracy}%`} label={`Identify (${stats!.byMode.identify.totalAttempts})`} />
                <Stat value={`${stats!.byMode.perform.accuracy}%`} label={`Perform (${stats!.byMode.perform.totalAttempts})`} />
              </div>
              <Link href="/history" className="inline-block text-primary hover:text-primary-dark font-semibold text-sm">
                View detailed stats →
              </Link>
            </div>

            {next.length > 0 && (
              <div className="card space-y-3">
                <h3 className="font-bold text-gray-900">Practise these next</h3>
                <ul className="divide-y divide-gray-100">
                  {next.map((s) => (
                    <li key={s.id} className="py-2 flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {s.stats.totalAttempts === 0 ? "Not tried yet" : `${s.stats.accuracy}% of ${s.stats.totalAttempts}`}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Link href="/learn/signals" className="text-sm font-bold text-primary hover:underline">
                    Revise signals →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-8 space-y-3">
            <p className="text-gray-600 font-medium">No signal attempts yet.</p>
            <Link href="/study/identify" className="btn-secondary inline-block">
              Try Identify
            </Link>
          </div>
        )}
        <p className="text-xs text-gray-500">
          Scores from mnemonic and radio exercises aren&apos;t saved yet. That&apos;s coming with progress tracking.
        </p>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { describeResult, type ResultArea } from "@/lib/drillResults";
import { localDay } from "@/lib/progress";

interface SavedResult {
  id: string;
  drill: string;
  item: string | null;
  score: number;
  total: number;
  mistakes: number;
  at: string;
}

interface SignalStat {
  id: string;
  name: string;
  stats: { totalAttempts: number; correctAttempts: number; accuracy: number };
}

const AREA_LABEL: Record<ResultArea, string> = {
  daily: "Daily practice",
  signals: "Signals",
  acronyms: "Acronyms",
  radio: "Radio",
};

const AREA_STYLE: Record<ResultArea, string> = {
  daily: "bg-secondary text-ink",
  signals: "bg-primary text-white",
  acronyms: "bg-sea text-white",
  radio: "bg-ink text-white",
};

const FILTERS: ("all" | ResultArea)[] = ["all", "daily", "signals", "acronyms", "radio"];

// Match rounds and built calls are scored on mistakes; everything else on right answers
const SCORED_ON_MISTAKES = new Set(["mnemonic_match", "radio_build_call"]);

function dayHeading(day: string): string {
  const today = localDay(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (day === today) return "Today";
  if (day === localDay(y)) return "Yesterday";
  const [yr, m, d] = day.split("-").map(Number);
  return new Date(yr, m - 1, d).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

function Score({ r }: { r: SavedResult }) {
  const perfect = SCORED_ON_MISTAKES.has(r.drill) ? r.mistakes === 0 : r.score === r.total;
  const text = SCORED_ON_MISTAKES.has(r.drill)
    ? r.mistakes === 0
      ? "No mistakes"
      : `${r.mistakes} mistake${r.mistakes === 1 ? "" : "s"}`
    : `${r.score}/${r.total}`;
  return (
    <span
      className={`shrink-0 rounded border-2 px-2 py-0.5 text-sm font-bold ${
        perfect ? "border-correct bg-correct text-white" : "border-ink bg-white text-ink"
      }`}
    >
      {perfect && "✓ "}
      {text}
    </span>
  );
}

export default function HistoryPage() {
  const [results, setResults] = useState<SavedResult[] | null>(null);
  const [signals, setSignals] = useState<SignalStat[]>([]);
  const [filter, setFilter] = useState<"all" | ResultArea>("all");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/drill-results?limit=200")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setResults)
      .catch(() => {
        setError(true);
        setResults([]);
      });
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => setSignals((s?.signalStats ?? []).filter((x: SignalStat) => x.stats.totalAttempts > 0)))
      .catch(() => {});
  }, []);

  const shown = (results ?? []).filter((r) => filter === "all" || describeResult(r.drill, r.item).area === filter);
  const byDay: [string, SavedResult[]][] = [];
  for (const r of shown) {
    const day = localDay(new Date(r.at));
    const last = byDay[byDay.length - 1];
    if (last && last[0] === day) last[1].push(r);
    else byDay.push([day, [r]]);
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">History</h1>
        <p className="text-stone-700">Every test and session you&apos;ve finished, newest first.</p>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Show">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`shrink-0 rounded-md border-2 border-ink px-2.5 py-1.5 font-display text-base font-bold leading-none ${
              filter === f ? "bg-secondary text-ink shadow-[2px_2px_0_#1C1917]" : "bg-white text-ink"
            }`}
          >
            {f === "all" ? "All" : f === "daily" ? "Daily" : AREA_LABEL[f]}
          </button>
        ))}
      </div>

      {results === null ? (
        <div className="card flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="card text-center text-ink">Couldn&apos;t load your history. Check your connection and try again.</div>
      ) : byDay.length === 0 ? (
        <div className="card space-y-3 text-center">
          <p className="text-ink">
            {filter === "all" ? "Nothing here yet. Finish a test and it'll show up here." : "Nothing here yet for this area."}
          </p>
          <Link href="/test/daily" className="btn-primary">
            Start today&apos;s practice
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {byDay.map(([day, rows]) => (
            <section key={day} className="space-y-2">
              <h2 className="font-display text-xl font-bold uppercase text-ink">{dayHeading(day)}</h2>
              <ul className="card divide-y-2 divide-stone-200 p-0">
                {rows.map((r) => {
                  const { area, title } = describeResult(r.drill, r.item);
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink">{title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-sm text-stone-600">
                          {area !== "daily" && (
                            <span className={`rounded px-1.5 py-px text-xs font-bold ${AREA_STYLE[area]}`}>{AREA_LABEL[area]}</span>
                          )}
                          {new Date(r.at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                      <Score r={r} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {signals.length > 0 && (filter === "all" || filter === "signals") && (
        <details className="group">
          <summary className="cursor-pointer font-display text-xl font-bold uppercase text-ink">Signals: all-time accuracy</summary>
          <ul className="mt-3 card space-y-3">
            {[...signals]
              .sort((a, b) => a.stats.accuracy - b.stats.accuracy)
              .map((s) => (
                <li key={s.id} className="space-y-1">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-ink">{s.name}</span>
                    <span className="text-stone-700">
                      {s.stats.correctAttempts}/{s.stats.totalAttempts} right
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-sm border border-ink bg-white">
                    <div
                      className={s.stats.accuracy >= 80 ? "h-full bg-correct" : s.stats.accuracy >= 50 ? "h-full bg-secondary" : "h-full bg-primary"}
                      style={{ width: `${s.stats.accuracy}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}

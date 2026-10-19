"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { TOPICS } from "@/content/topics";
import { correctInARow, masteryOf, practiceStreak, MASTERY_STREAK, type Mastery } from "@/lib/progress";

interface SignalStat {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  stats: { totalAttempts: number; correctAttempts: number; accuracy: number };
}

interface StatsResponse {
  overall: { totalAttempts: number };
  signalStats?: SignalStat[];
  recentResults?: Record<string, boolean[]>;
  practiceTimes?: string[];
}

interface SignalProgress extends SignalStat {
  mastery: Mastery;
  inARow: number;
}

const ORDER: Record<Mastery, number> = { learning: 0, new: 1, mastered: 2 };

function progressFor(stats: StatsResponse): SignalProgress[] {
  return (stats.signalStats ?? []).map((s) => {
    const recent = stats.recentResults?.[s.id] ?? [];
    // Practised, but not recently enough to be in the latest results
    const mastery = recent.length === 0 && s.stats.totalAttempts > 0 ? "learning" : masteryOf(recent);
    return { ...s, mastery, inARow: correctInARow(recent) };
  });
}

// What to practise next: closest to slipping first (learning, lowest accuracy), then new ones
function nextUp(signals: SignalProgress[], count = 3): SignalProgress[] {
  return [...signals]
    .filter((s) => s.mastery !== "mastered")
    .sort((a, b) => ORDER[a.mastery] - ORDER[b.mastery] || a.stats.accuracy - b.stats.accuracy)
    .slice(0, count);
}

function SignalTile({ s }: { s: SignalProgress }) {
  const status =
    s.mastery === "mastered" ? "Mastered" : s.mastery === "new" ? "Not tried" : `${s.inARow} of ${MASTERY_STREAK} in a row`;
  return (
    <li
      className={`flex flex-col rounded-md border-2 p-2 text-center ${
        s.mastery === "mastered"
          ? "border-correct bg-green-50"
          : s.mastery === "learning"
            ? "border-ink bg-white"
            : "border-dashed border-stone-300 bg-white opacity-70"
      }`}
    >
      <div className="relative mx-auto aspect-square w-full max-w-[5.5rem]">
        <Image src={s.imageUrl} alt="" fill sizes="88px" className="object-contain mix-blend-multiply" />
      </div>
      <span className="mt-1 text-xs font-semibold leading-tight text-ink">{s.name}</span>
      <span
        className={`mt-1 text-[11px] font-bold uppercase tracking-wide ${
          s.mastery === "mastered" ? "text-correct" : s.mastery === "learning" ? "text-primary" : "text-stone-500"
        }`}
      >
        {s.mastery === "mastered" && "✓ "}
        {status}
      </span>
    </li>
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
  const signals = stats ? progressFor(stats) : [];
  const mastered = signals.filter((s) => s.mastery === "mastered").length;
  const total = signals.length || 14;
  const next = nextUp(signals);
  const streak = practiceStreak(stats?.practiceTimes ?? []);
  const allMastered = signals.length > 0 && mastered === signals.length;
  const tiles = [...signals].sort((a, b) => ORDER[a.mastery] - ORDER[b.mastery] || a.name.localeCompare(b.name));

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">
          {firstName ? `G'day, ${firstName}` : "G'day"}
        </h1>
      </header>

      {loading ? (
        <div className="card flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : hasAttempts ? (
        <section className="space-y-5">
          {/* The goal: master all 14 signals */}
          <div className="card-highlight space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <p className="font-display text-6xl font-extrabold leading-none text-ink">
                  {mastered}
                  <span className="text-3xl text-stone-500"> / {total}</span>
                </p>
                <p className="mt-1 font-semibold text-ink">signals mastered</p>
              </div>
              <p className="text-sm font-semibold text-ink">
                {streak.days === 0
                  ? "Practise today to start a streak"
                  : streak.doneToday
                    ? `${streak.days}-day streak. Nice work today.`
                    : `${streak.days}-day streak. Practise today to keep it going.`}
              </p>
            </div>

            <div className="flex gap-1" role="img" aria-label={`${mastered} of ${total} signals mastered`}>
              {tiles.map((s) => (
                <span
                  key={s.id}
                  className={`h-3 flex-1 rounded-sm border border-ink ${
                    s.mastery === "mastered" ? "bg-correct" : s.mastery === "learning" ? "bg-secondary" : "bg-white"
                  }`}
                />
              ))}
            </div>

            {allMastered ? (
              <div className="space-y-3">
                <p className="text-ink">All {total} mastered. Keep them sharp by performing them on camera.</p>
                <Link href="/study/perform" className="btn-primary">
                  Perform signals
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-ink">
                  <span className="font-semibold">Next up:</span> {next.map((s) => s.name).join(", ")}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/study/identify" className="btn-primary">
                    Keep going
                  </Link>
                  <Link href="/study/perform" className="btn-outline">
                    Perform on camera
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Every signal and where you are with it */}
          <div className="space-y-2">
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
              {tiles.map((s) => (
                <SignalTile key={s.id} s={s} />
              ))}
            </ul>
            <p className="text-sm text-stone-600">
              A signal is mastered when your last {MASTERY_STREAK} tries at it were right.{" "}
              <Link href="/history" className="font-semibold text-primary hover:underline">
                See your history
              </Link>
            </p>
          </div>
        </section>
      ) : (
        <section className="card-highlight space-y-3">
          <h2 className="font-display text-3xl font-extrabold uppercase text-ink">Master all 14 signals</h2>
          <p className="text-ink">
            Start by naming a few from their pictures. Get one right {MASTERY_STREAK} times in a row and it&apos;s mastered.
          </p>
          <Link href="/study/identify" className="btn-primary">
            Name your first signal
          </Link>
        </section>
      )}

      {/* Everything else */}
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-bold uppercase text-ink">Learn and test</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TOPICS.map((t) => (
            <div key={t.id} className="card flex flex-col gap-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink">{t.title}</h3>
                <p className="text-sm text-stone-700">{t.blurb}</p>
              </div>
              <div className="flex gap-2">
                <Link href={t.learnHref} className="btn-outline flex-1 !px-3 !text-lg">
                  Learn
                </Link>
                <Link href={t.testHref} className="btn-secondary flex-1 !px-3 !text-lg">
                  Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

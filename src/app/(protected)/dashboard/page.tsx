"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { correctInARow, masteryOf, practiceStreak, levelFor, LEVEL_LABEL, MASTERY_STREAK, type Level, type Mastery } from "@/lib/progress";
import { mnemonicProgress, radioProgress, RADIO_PASS_MARK, type LatestResult } from "@/lib/drillResults";
import { getTopic } from "@/content/topics";
import { track } from "@/lib/analytics";

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
  drillResults?: LatestResult[];
}

const LEVEL_STYLE: Record<Level, string> = {
  "not-started": "border-dashed border-stone-400 text-stone-600 bg-white",
  learning: "border-ink bg-secondary text-ink",
  ready: "border-correct bg-green-50 text-correct",
  "patrol-ready": "border-ink bg-correct text-white",
};

const RADIO_NAMES: Record<string, string> = {
  prowords: "Prowords",
  phonetic: "Phonetic letters",
  spell: "Spell it",
  calls: "Build the call",
};

// A row of segments, one per item: green done, yellow started, white not yet
function Segments({ states, label }: { states: ("done" | "started" | "none")[]; label: string }) {
  return (
    <div className="flex gap-1" role="img" aria-label={label}>
      {states.map((st, i) => (
        <span
          key={i}
          className={`h-3 flex-1 rounded-sm border border-ink ${
            st === "done" ? "bg-correct" : st === "started" ? "bg-secondary" : "bg-white"
          }`}
        />
      ))}
    </div>
  );
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

  const latest = stats?.drillResults ?? [];
  const mnems = mnemonicProgress(latest);
  const mnemMastered = mnems.filter((m) => m.mastered).length;
  // Carry on with one you've started, otherwise the next new one
  const nextMnem = mnems.find((m) => m.tried && !m.mastered) ?? mnems.find((m) => !m.mastered);
  const radio = radioProgress(latest);
  const radioPassed = radio.filter((r) => r.passed).length;
  const nextRadio = radio.find((r) => r.tried && !r.passed) ?? radio.find((r) => !r.passed);
  const anyActivity = hasAttempts || latest.length > 0;

  // One summary row per area, and a single "next up": the area you're furthest behind in
  const areas = [
    {
      id: "signals",
      label: "Signals",
      done: mastered,
      total,
      unit: "mastered",
      tried: hasAttempts,
      states: tiles.map((t) => (t.mastery === "mastered" ? "done" : t.mastery === "learning" ? "started" : "none")) as ("done" | "started" | "none")[],
      next: allMastered
        ? null
        : hasAttempts
          ? { text: next.map((n) => n.name).join(", "), href: "/study/identify?start=quick", cta: "Keep going with signals" }
          : { text: "Name your first signal", href: "/study/identify?start=quick", cta: "Start with signals" },
    },
    {
      id: "acronyms",
      label: "Acronyms",
      done: mnemMastered,
      total: mnems.length,
      unit: "mastered",
      tried: mnems.some((m) => m.tried),
      states: mnems.map((m) => (m.mastered ? "done" : m.tried ? "started" : "none")) as ("done" | "started" | "none")[],
      next: nextMnem
        ? {
            text: `${nextMnem.name}: ${nextMnem.quizDone ? "a Match round with no mistakes" : "a perfect quiz"}`,
            href: `/test/acronyms/${nextMnem.slug}?mode=${nextMnem.quizDone ? "match" : "quiz"}`,
            cta: `Test yourself on ${nextMnem.name}`,
          }
        : null,
    },
    {
      id: "radio",
      label: "Radio",
      done: radioPassed,
      total: radio.length,
      unit: "passed",
      tried: radio.some((r) => r.tried),
      states: radio.map((r) => (r.passed ? "done" : r.tried ? "started" : "none")) as ("done" | "started" | "none")[],
      next: nextRadio
        ? { text: RADIO_NAMES[nextRadio.id], href: `/test/radio/${nextRadio.id}`, cta: `Test yourself: ${RADIO_NAMES[nextRadio.id]}` }
        : null,
    },
  ];
  const focus = [...areas].filter((a) => a.next).sort((a, b) => a.done / a.total - b.done / b.total)[0];

  // Anonymous "level_reached" when an area moves up a level since the last visit
  // on this device. The first visit just records where you are.
  const levelKey = areas.map((a) => `${a.id}:${levelFor(a.done, a.total, a.tried)}`).join(",");
  useEffect(() => {
    if (loading || !stats) return;
    const RANK: Record<Level, number> = { "not-started": 0, learning: 1, ready: 2, "patrol-ready": 3 };
    const now = Object.fromEntries(levelKey.split(",").map((p) => p.split(":"))) as Record<string, Level>;
    try {
      const before = JSON.parse(localStorage.getItem("ss-levels") ?? "null") as Record<string, Level> | null;
      if (before) {
        for (const [area, level] of Object.entries(now)) {
          if (before[area] && RANK[level] > RANK[before[area]]) track("level_reached", { area, level });
        }
      }
      localStorage.setItem("ss-levels", JSON.stringify(now));
    } catch {
      /* storage unavailable */
    }
  }, [loading, stats, levelKey]);

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">
          {firstName ? `G'day, ${firstName}` : "G'day"}
        </h1>
        {!loading && anyActivity && (
          <p className="font-semibold text-ink">
            {streak.days === 0
              ? "Practise today to start a streak."
              : streak.doneToday
                ? `${streak.days}-day streak. Nice work today.`
                : `${streak.days}-day streak. Practise today to keep it going.`}
          </p>
        )}
      </header>

      {loading ? (
        <div className="card flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Today: one thing to do */}
          <section className="card-highlight space-y-5">
            {focus?.next ? (
              <div className="space-y-3">
                <p className="text-sm font-bold uppercase tracking-widest text-primary">Today</p>
                <p className="font-display text-3xl font-extrabold uppercase leading-tight text-ink">
                  {anyActivity ? focus.label : "Start with the signals"}
                </p>
                <p className="text-ink">{focus.next.text}</p>
                <Link
                  href="/test/daily"
                  onClick={() => track("dashboard_cta", { target: "daily", focus: focus.id })}
                  className="btn-primary w-full sm:w-auto"
                >
                  Start today&apos;s practice
                </Link>
                <p className="text-sm text-stone-600">
                  Four quick questions: a signal, an acronym, a radio call and one from the PSAR manual.{" "}
                  <Link
                    href={focus.next.href}
                    onClick={() => track("dashboard_cta", { target: "area", focus: focus.id })}
                    className="font-semibold text-primary hover:underline"
                  >
                    Or go straight to {focus.label.toLowerCase()}
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="font-display text-3xl font-extrabold uppercase text-ink">You&apos;re patrol-ready</p>
                <p className="text-ink">Everything mastered. Keep it sharp with a few questions a day.</p>
                <Link href="/test/daily" className="btn-primary w-full sm:w-auto">
                  Start today&apos;s practice
                </Link>
              </div>
            )}

            {/* Where you're at, one word per area */}
            <ul className="grid grid-cols-3 gap-2 border-t-2 border-ink pt-4">
              {areas.map((a) => {
                const level = levelFor(a.done, a.total, a.tried);
                return (
                  <li key={a.id}>
                    <Link href={`/test/${a.id}`} className="block text-center">
                      <span className="block font-display text-lg font-bold uppercase text-ink">{a.label}</span>
                      <span className={`mt-1 inline-block rounded border-2 px-2 py-0.5 text-xs font-bold leading-tight ${LEVEL_STYLE[level]}`}>
                        {level === "patrol-ready" && "✓ "}
                        {LEVEL_LABEL[level]}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* The detail, for anyone who wants it */}
          {anyActivity && (
            <details className="group">
              <summary className="cursor-pointer font-display text-xl font-bold uppercase text-ink">
                Show details
              </summary>
              <div className="mt-4 space-y-6">
                <ul className="space-y-4">
                  {areas.map((a) => (
                    <li key={a.id} className="space-y-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-bold text-ink">{a.label}</span>
                        <span className="text-sm text-stone-700">
                          {a.done} of {a.total} {a.unit}
                        </span>
                      </div>
                      <Segments states={a.states} label={`${a.label}: ${a.done} of ${a.total} ${a.unit}`} />
                    </li>
                  ))}
                </ul>
                {hasAttempts && (
                  <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                    {tiles.map((t) => (
                      <SignalTile key={t.id} s={t} />
                    ))}
                  </ul>
                )}
                <p className="text-xs text-stone-600">
                  Levels: In training once you&apos;ve started, Shadow patrolling at three quarters, Patrol-ready when
                  everything is done. A signal is mastered when your last {MASTERY_STREAK} tries were right; an acronym after a
                  perfect quiz and a Match round with no mistakes; a radio test is passed at{" "}
                  {Math.round(RADIO_PASS_MARK * 100)}% or more, or a call built with no mistakes.{" "}
                  <Link href="/history" className="font-semibold text-primary hover:underline">
                    Signal history
                  </Link>
                </p>
              </div>
            </details>
          )}
        </>
      )}

      <p className="text-sm text-stone-600">
        Want to read up first?{" "}
        {(["signals", "acronyms", "radio"] as const).map((id, i) => (
          <span key={id}>
            {i > 0 && " · "}
            <Link href={getTopic(id).learnHref} className="font-semibold text-primary hover:underline">
              Learn {id}
            </Link>
          </span>
        ))}
      </p>
    </div>
  );
}

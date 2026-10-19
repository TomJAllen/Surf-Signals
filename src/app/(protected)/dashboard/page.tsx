"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { correctInARow, masteryOf, practiceStreak, MASTERY_STREAK, type Mastery } from "@/lib/progress";
import { mnemonicProgress, radioProgress, RADIO_PASS_MARK, type LatestResult } from "@/lib/drillResults";
import { getTopic } from "@/content/topics";

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
      states: tiles.map((t) => (t.mastery === "mastered" ? "done" : t.mastery === "learning" ? "started" : "none")) as ("done" | "started" | "none")[],
      next: allMastered
        ? null
        : hasAttempts
          ? { text: next.map((n) => n.name).join(", "), href: "/study/identify", cta: "Keep going with signals" }
          : { text: "Name your first signal", href: "/study/identify", cta: "Start with signals" },
    },
    {
      id: "mnemonics",
      label: "Mnemonics",
      done: mnemMastered,
      total: mnems.length,
      unit: "mastered",
      states: mnems.map((m) => (m.mastered ? "done" : m.tried ? "started" : "none")) as ("done" | "started" | "none")[],
      next: nextMnem
        ? {
            text: `${nextMnem.name}: ${nextMnem.quizDone ? "a Match round with no mistakes" : "a perfect quiz"}`,
            href: `/test/mnemonics/${nextMnem.slug}?mode=${nextMnem.quizDone ? "match" : "quiz"}`,
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
      states: radio.map((r) => (r.passed ? "done" : r.tried ? "started" : "none")) as ("done" | "started" | "none")[],
      next: nextRadio
        ? { text: RADIO_NAMES[nextRadio.id], href: `/test/radio/${nextRadio.id}`, cta: `Test yourself: ${RADIO_NAMES[nextRadio.id]}` }
        : null,
    },
  ];
  const focus = [...areas].filter((a) => a.next).sort((a, b) => a.done / a.total - b.done / b.total)[0];

  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">
          {firstName ? `G'day, ${firstName}` : "G'day"}
        </h1>
        {!loading && anyActivity && (
          <p className="font-semibold text-ink">
            {streak.days === 0
              ? "Do a test today to start a streak."
              : streak.doneToday
                ? `${streak.days}-day streak. Nice work today.`
                : `${streak.days}-day streak. Do a test today to keep it going.`}
          </p>
        )}
      </header>

      {loading ? (
        <div className="card flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          {/* Everything at a glance: one row per area, one thing to do next */}
          <section className="card-highlight space-y-5">
            <ul className="space-y-4">
              {areas.map((a) => (
                <li key={a.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link href={`/test/${a.id}`} className="font-display text-2xl font-bold uppercase text-ink hover:underline">
                      {a.label}
                    </Link>
                    <span className="text-sm font-semibold text-ink">
                      <span className="font-display text-2xl font-extrabold">{a.done}</span>
                      <span className="text-stone-500"> / {a.total}</span> {a.unit}
                    </span>
                  </div>
                  <Segments states={a.states} label={`${a.label}: ${a.done} of ${a.total} ${a.unit}`} />
                  {a.next && a !== focus && (
                    <p className="text-sm text-stone-700">
                      Next:{" "}
                      <Link href={a.next.href} className="font-semibold text-primary hover:underline">
                        {a.next.text}
                      </Link>
                    </p>
                  )}
                </li>
              ))}
            </ul>

            {focus?.next ? (
              <div className="space-y-3 border-t-2 border-ink pt-4">
                <p className="text-ink">
                  <span className="font-semibold">Next up:</span> {focus.next.text}
                </p>
                <Link href={focus.next.href} className="btn-primary">
                  {focus.next.cta}
                </Link>
              </div>
            ) : (
              <p className="border-t-2 border-ink pt-4 font-semibold text-ink">
                Everything mastered. Keep it sharp with the mixed quiz and Perform mode.
              </p>
            )}

            <details className="text-xs text-stone-600">
              <summary className="cursor-pointer font-semibold">How progress is counted</summary>
              <p className="mt-1">
                A signal is mastered when your last {MASTERY_STREAK} tries were right. A mnemonic is mastered after a
                perfect quiz and a Match round with no mistakes. A radio test is passed at{" "}
                {Math.round(RADIO_PASS_MARK * 100)}% or more, or with a call built with no mistakes.
              </p>
            </details>
          </section>

          <section>
            {hasAttempts && (
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold uppercase text-ink">Your signals</h2>
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
                  {tiles.map((s) => (
                    <SignalTile key={s.id} s={s} />
                  ))}
                </ul>
                <Link href="/history" className="inline-block text-sm font-semibold text-primary hover:underline">
                  See your history
                </Link>
              </div>
            )}
          </section>
        </>
      )}

      <p className="text-sm text-stone-600">
        Want to read up first?{" "}
        {(["signals", "mnemonics", "radio"] as const).map((id, i) => (
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

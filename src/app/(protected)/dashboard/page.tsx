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

function Count({ value, total, label }: { value: number; total: number; label: string }) {
  return (
    <div>
      <p className="font-display text-5xl font-extrabold leading-none text-ink">
        {value}
        <span className="text-2xl text-stone-500"> / {total}</span>
      </p>
      <p className="mt-1 font-semibold text-ink">{label}</p>
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
          {/* Signals: master all 14 */}
          <section className="space-y-4">
            <div className="card-highlight space-y-5">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Signals</p>
              {hasAttempts ? (
                <>
                  <Count value={mastered} total={total} label="signals mastered" />
                  <Segments
                    states={tiles.map((s) => (s.mastery === "mastered" ? "done" : s.mastery === "learning" ? "started" : "none"))}
                    label={`${mastered} of ${total} signals mastered`}
                  />
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
                </>
              ) : (
                <>
                  <h2 className="font-display text-3xl font-extrabold uppercase text-ink">Master all 14 signals</h2>
                  <p className="text-ink">
                    Name them from their pictures. Get one right {MASTERY_STREAK} times in a row and it&apos;s mastered.
                  </p>
                  <Link href="/study/identify" className="btn-primary">
                    Name your first signal
                  </Link>
                </>
              )}
            </div>

          </section>

          <section className="grid gap-5 md:grid-cols-2">
            {/* Mnemonics: a perfect quiz and a clean Match round each */}
            <div className="card flex flex-col gap-4">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Mnemonics</p>
              <Count value={mnemMastered} total={mnems.length} label="mnemonics mastered" />
              <Segments
                states={mnems.map((m) => (m.mastered ? "done" : m.tried ? "started" : "none"))}
                label={`${mnemMastered} of ${mnems.length} mnemonics mastered`}
              />
              {nextMnem ? (
                <div className="mt-auto space-y-3">
                  <p className="text-ink">
                    <span className="font-semibold">Next up:</span> {nextMnem.name},{" "}
                    {nextMnem.quizDone ? "a Match round with no mistakes" : "a perfect quiz"}
                  </p>
                  <Link
                    href={`/test/mnemonics/${nextMnem.slug}?mode=${nextMnem.quizDone ? "match" : "quiz"}`}
                    className="btn-secondary"
                  >
                    Test yourself on {nextMnem.name}
                  </Link>
                </div>
              ) : (
                <p className="mt-auto text-ink">All {mnems.length} mastered. Try the mixed quiz to keep them fresh.</p>
              )}
              <p className="text-xs text-stone-600">Mastered = a perfect quiz and a Match round with no mistakes.</p>
            </div>

            {/* Radio: pass each test */}
            <div className="card flex flex-col gap-4">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Radio</p>
              <Count value={radioPassed} total={radio.length} label="radio tests passed" />
              <ul className="space-y-1">
                {radio.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 text-ink">
                    <Link href={`/test/radio/${r.id}`} className="hover:underline">
                      {RADIO_NAMES[r.id]}
                    </Link>
                    <span
                      className={`text-xs font-bold uppercase tracking-wide ${
                        r.passed ? "text-correct" : r.tried ? "text-primary" : "text-stone-500"
                      }`}
                    >
                      {r.passed ? "✓ Passed" : r.tried ? "Not yet" : "Not tried"}
                    </span>
                  </li>
                ))}
              </ul>
              {nextRadio ? (
                <Link href={`/test/radio/${nextRadio.id}`} className="btn-secondary mt-auto self-start">
                  Next: {RADIO_NAMES[nextRadio.id]}
                </Link>
              ) : (
                <p className="mt-auto text-ink">All passed. Nice radio work.</p>
              )}
              <p className="text-xs text-stone-600">
                Passed = {Math.round(RADIO_PASS_MARK * 100)}% or more, or a call built with no mistakes.
              </p>
            </div>
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
                <p className="text-sm text-stone-600">
                  A signal is mastered when your last {MASTERY_STREAK} tries at it were right.{" "}
                  <Link href="/history" className="font-semibold text-primary hover:underline">
                    See your history
                  </Link>
                </p>
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

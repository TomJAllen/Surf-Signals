import Link from "next/link";
import { TOPICS } from "@/content/topics";

const FOR: Record<string, string> = {
  signals: "Name them from a picture, then perform them on camera.",
  acronyms: "Quiz each letter, then drag real patient details onto the right one.",
  radio: "Prowords, the phonetic alphabet, spelling call signs and building calls.",
};

export default function TestHubPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Test yourself</h1>
        <p className="max-w-2xl text-stone-700">
          Pick an area. Short tests you can do in a few minutes, with the answer explained when you get one wrong.
        </p>
      </header>
      <Link
        href="/test/daily"
        className="block rounded-lg border-2 border-ink bg-secondary p-5 shadow-[4px_4px_0_#1C1917] transition-[transform,box-shadow] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
      >
        <span className="font-display text-3xl font-extrabold uppercase text-ink">Today&apos;s practice →</span>
        <span className="mt-1 block text-ink">
          Four quick questions: a signal, an acronym, a radio call and one from the PSAR manual.
        </span>
      </Link>
      <div className="grid gap-4 md:grid-cols-3">
        {TOPICS.map((t) => {
          const ready = t.exercises.filter((e) => e.href).length;
          const soon = t.exercises.length - ready;
          return (
            <Link
              key={t.id}
              href={t.testHref}
              className="flex flex-col rounded-lg border-2 border-ink bg-white p-5 shadow-[4px_4px_0_#1C1917] transition-[transform,box-shadow,background-color] hover:bg-secondary/30 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <span className="font-display text-3xl font-extrabold uppercase text-ink">{t.title} →</span>
              <span className="mt-2 flex-1 text-stone-700">{FOR[t.id]}</span>
              <span className="mt-4 text-sm font-semibold text-stone-600">
                {ready} test{ready === 1 ? "" : "s"}
                {soon > 0 && ` · ${soon} coming soon`}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

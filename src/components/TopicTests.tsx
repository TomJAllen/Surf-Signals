import Link from "next/link";
import { getTopic, type TopicId } from "@/content/topics";
import Breadcrumbs from "@/components/Breadcrumbs";
import ExerciseCard from "@/components/ExerciseCard";

// The page for one area of Test (Signals, Mnemonics or Radio): its tests, with
// any extra content for that area underneath.
export default function TopicTests({ topic, children }: { topic: TopicId; children?: React.ReactNode }) {
  const t = getTopic(topic);
  // Don't link an area page to itself
  const exercises = t.exercises.filter((e) => !e.href || !e.href.startsWith(`${t.testHref}#`));
  return (
    <div className="space-y-8 pb-12">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }]} />
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-extrabold uppercase text-ink">Test your {t.title.toLowerCase()}</h1>
        <p className="text-stone-700">
          {t.blurb} Need a refresher?{" "}
          <Link href={t.learnHref} className="font-semibold text-primary hover:underline">
            Learn {t.title.toLowerCase()}
          </Link>
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exercises.map((e) => (
          <ExerciseCard key={e.title} exercise={e} />
        ))}
      </div>
      {children}
    </div>
  );
}

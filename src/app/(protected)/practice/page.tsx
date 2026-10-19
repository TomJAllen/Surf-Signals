import Link from "next/link";
import { TOPICS } from "@/content/topics";
import ExerciseCard from "@/components/ExerciseCard";

export default function PracticeHubPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Practice</h1>
        <p className="text-gray-600 max-w-2xl">
          Exercises for everything in Learn. Pick a topic and test yourself. New exercises are on the way.
        </p>
      </header>

      {TOPICS.map((t) => (
        <section key={t.id} id={t.id} className="space-y-3 scroll-mt-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.blurb}</p>
            </div>
            <Link href={t.learnHref} className="shrink-0 text-sm font-bold text-primary hover:underline">
              Learn {t.title.toLowerCase()} →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {t.exercises.map((e) => (
              <ExerciseCard key={e.title} exercise={e} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

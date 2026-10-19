import Link from "next/link";
import type { Exercise } from "@/content/topics";

// One test; greyed out with a "Coming soon" tag when it has no link yet
export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-display text-2xl font-bold leading-tight text-ink">{exercise.title}</p>
        {exercise.href ? (
          <span className="font-bold text-primary" aria-hidden>
            →
          </span>
        ) : (
          <span className="shrink-0 rounded border-2 border-stone-300 px-2 py-0.5 text-xs font-bold text-stone-500">
            Coming soon
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-stone-700">{exercise.description}</p>
    </>
  );

  return exercise.href ? (
    <Link
      href={exercise.href}
      className="block rounded-lg border-2 border-ink bg-white p-4 shadow-[3px_3px_0_#1C1917] transition-[transform,box-shadow,background-color] hover:bg-secondary/30 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
    >
      {inner}
    </Link>
  ) : (
    <div className="rounded-lg border-2 border-dashed border-stone-300 bg-white p-4 opacity-75" aria-disabled>
      {inner}
    </div>
  );
}

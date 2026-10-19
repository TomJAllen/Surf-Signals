import Link from "next/link";
import type { Exercise } from "@/content/topics";

// One practice exercise; greyed out with a "Coming soon" tag when it has no link yet
export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-gray-900">{exercise.title}</p>
        {exercise.href ? (
          <span className="text-primary font-bold" aria-hidden>
            →
          </span>
        ) : (
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">Coming soon</span>
        )}
      </div>
      <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
    </>
  );

  return exercise.href ? (
    <Link
      href={exercise.href}
      className="block bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-secondary hover:shadow-md transition-all"
    >
      {inner}
    </Link>
  ) : (
    <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 opacity-80" aria-disabled>
      {inner}
    </div>
  );
}

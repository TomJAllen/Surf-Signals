import Link from "next/link";
import { TOPICS } from "@/content/topics";
import { MNEMONICS } from "@/content/mnemonics";

const DETAIL: Record<string, { blurb: string; tags: string[] }> = {
  signals: {
    blurb: "All 14 beach and water signals: what they mean, how to do them, and official demo videos.",
    tags: ["Beach to Water", "Water to Beach"],
  },
  mnemonics: {
    blurb: "Assessment, handover, first aid and patrol memory aids, each explained letter by letter.",
    tags: MNEMONICS.slice(0, 5).map((m) => m.name),
  },
  radio: {
    blurb: "Making calls, prowords, the phonetic alphabet and reporting incidents with the 4 Ps.",
    tags: ["Prowords", "Phonetic", "4 Ps"],
  },
};

export default function LearnHubPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Learn</h1>
        <p className="text-gray-600 max-w-2xl">
          What you need to know for patrol, your Bronze Medallion and SRC. Based on the SLSA Public Safety
          and Aquatic Rescue Training Manual (35th edition). When you&apos;re ready, test yourself in Practice.
        </p>
      </header>
      <div className="grid md:grid-cols-3 gap-4">
        {TOPICS.map((t) => (
          <div key={t.id} className="card flex flex-col gap-3 border-2 border-transparent hover:border-secondary transition-all">
            <Link href={t.learnHref} className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{t.title} →</h2>
              <p className="text-gray-600">{DETAIL[t.id].blurb}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {DETAIL[t.id].tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600">{tag}</span>
                ))}
              </div>
            </Link>
            <div className="pt-2 border-t border-gray-100">
              <Link href={`/practice#${t.id}`} className="text-sm font-bold text-primary hover:underline">
                Practise {t.title.toLowerCase()} ({t.exercises.filter((e) => e.href).length} exercises) →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

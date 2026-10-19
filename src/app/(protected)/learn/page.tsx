import Link from "next/link";
import { MNEMONICS } from "@/content/mnemonics";

const SECTIONS = [
  {
    href: "/learn/signals",
    title: "Signals",
    blurb: "All 14 beach and water signals: what they mean, how to do them, and official demo videos.",
    tags: ["Beach to Water", "Water to Beach"],
    cta: [
      { href: "/study/identify", label: "Identify" },
      { href: "/study/perform", label: "Perform" },
    ],
  },
  {
    href: "/learn/mnemonics",
    title: "Mnemonics",
    blurb: "Assessment, handover, first aid and patrol memory aids, with quizzes and scenario drills.",
    tags: MNEMONICS.slice(0, 5).map((m) => m.name),
    cta: [],
  },
  {
    href: "/learn/radio",
    title: "Radio",
    blurb: "Making calls, prowords, the phonetic alphabet and reporting incidents with the 4 Ps.",
    tags: ["Prowords", "Phonetic", "4 Ps"],
    cta: [{ href: "/learn/radio/practice", label: "Practise" }],
  },
];

export default function LearnHubPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Learn</h1>
        <p className="text-gray-600 max-w-2xl">
          What you need to know for patrol, your Bronze Medallion and SRC. Based on the SLSA Public Safety
          and Aquatic Rescue Training Manual (35th edition).
        </p>
      </header>
      <div className="grid md:grid-cols-3 gap-4">
        {SECTIONS.map((s) => (
          <div key={s.href} className="card flex flex-col gap-3 border-2 border-transparent hover:border-secondary transition-all">
            <Link href={s.href} className="space-y-2 flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{s.title} →</h2>
              <p className="text-gray-600">{s.blurb}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {s.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-600">{t}</span>
                ))}
              </div>
            </Link>
            {s.cta.length > 0 && (
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {s.cta.map((c) => (
                  <Link key={c.href} href={c.href} className="text-sm font-bold text-primary hover:underline">
                    {c.label} →
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import TrackView from "@/components/TrackView";
import { MNEMONICS, MNEMONIC_GROUPS, getMnemonic } from "@/content/mnemonics";
import MnemonicTrainer from "@/components/drills/MnemonicTrainer";
import Breadcrumbs from "@/components/Breadcrumbs";

export function generateStaticParams() {
  return MNEMONICS.map((m) => ({ slug: m.slug }));
}

export default async function MnemonicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getMnemonic(slug);
  if (!m) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <TrackView event="learn_viewed" props={{ area: "acronyms", item: m.slug }} />
      <Breadcrumbs trail={[{ href: "/learn", label: "Learn" }, { href: "/learn/acronyms", label: "Acronyms" }]} />
      <header className="space-y-2">
        <p className="text-sm font-bold text-primary uppercase tracking-wide">{MNEMONIC_GROUPS[m.group].label}</p>
        <h1 className="text-3xl font-bold text-gray-900">
          {m.name} <span className="text-gray-500 font-medium">· {m.title}</span>
        </h1>
        <p className="text-gray-600">{m.when}</p>
      </header>
      <MnemonicTrainer slug={m.slug} modes={["learn"]} practiceHref={`/test/acronyms/${m.slug}`} />
      <p className="text-xs text-gray-500">
        Source: SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., {m.source}. Summarised in our own words.
      </p>
    </div>
  );
}

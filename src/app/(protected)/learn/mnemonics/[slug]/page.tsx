import Link from "next/link";
import { notFound } from "next/navigation";
import { MNEMONICS, MNEMONIC_GROUPS, getMnemonic } from "@/content/mnemonics";
import MnemonicTrainer from "@/components/drills/MnemonicTrainer";

export function generateStaticParams() {
  return MNEMONICS.map((m) => ({ slug: m.slug }));
}

export default function MnemonicPage({ params }: { params: { slug: string } }) {
  const m = getMnemonic(params.slug);
  if (!m) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <nav className="text-sm text-gray-500">
        <Link href="/learn" className="hover:underline">Learn</Link> /{" "}
        <Link href="/learn/mnemonics" className="hover:underline">Mnemonics</Link>
      </nav>
      <header className="space-y-2">
        <p className="text-sm font-bold text-primary uppercase tracking-wide">{MNEMONIC_GROUPS[m.group].label}</p>
        <h1 className="text-3xl font-bold text-gray-900">
          {m.name} <span className="text-gray-500 font-medium">· {m.title}</span>
        </h1>
        <p className="text-gray-600">{m.when}</p>
      </header>
      <MnemonicTrainer slug={m.slug} />
      <p className="text-xs text-gray-500">
        Source: SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., {m.source}. Summarised in our own words.
      </p>
    </div>
  );
}

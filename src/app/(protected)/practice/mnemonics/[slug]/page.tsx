import Link from "next/link";
import { notFound } from "next/navigation";
import { MNEMONICS, getMnemonic } from "@/content/mnemonics";
import MnemonicTrainer, { type MnemonicMode } from "@/components/drills/MnemonicTrainer";

export function generateStaticParams() {
  return MNEMONICS.map((m) => ({ slug: m.slug }));
}

export default async function PracticeMnemonicPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const m = getMnemonic(slug);
  if (!m) notFound();
  const mode = (["quiz", "order", "sort"] as MnemonicMode[]).find((x) => x === query.mode);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <nav className="text-sm text-gray-500">
        <Link href="/practice" className="hover:underline">Practice</Link> /{" "}
        <Link href="/practice/mnemonics" className="hover:underline">Mnemonics</Link>
      </nav>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {m.name} <span className="text-gray-500 font-medium">· {m.title}</span>
        </h1>
        <p className="text-gray-600">
          Need a refresher?{" "}
          <Link href={`/learn/mnemonics/${m.slug}`} className="text-primary font-semibold hover:underline">
            Learn {m.name}
          </Link>
        </p>
      </header>
      <MnemonicTrainer slug={m.slug} modes={["quiz", "order", "sort"]} initialMode={mode} />
    </div>
  );
}

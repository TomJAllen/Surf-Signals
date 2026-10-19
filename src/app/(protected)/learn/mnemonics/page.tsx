import Link from "next/link";
import { MNEMONICS, MNEMONIC_GROUPS, type MnemonicGroup } from "@/content/mnemonics";

const ORDER: MnemonicGroup[] = ["handover", "first-aid", "patrol"];

export default function MnemonicsPage() {
  return (
    <div className="space-y-8 pb-12">
      <nav className="text-sm text-gray-500">
        <Link href="/learn" className="hover:underline">Learn</Link>
      </nav>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Mnemonics</h1>
        <p className="text-gray-600 max-w-2xl">
          The memory aids from your Bronze and SRC training. Learn each one, then quiz yourself, put it in
          order, and for the handover ones, sort a real scenario into it.
        </p>
      </header>

      {ORDER.map((g) => (
        <section key={g} className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{MNEMONIC_GROUPS[g].label}</h2>
            <p className="text-sm text-gray-600">{MNEMONIC_GROUPS[g].blurb}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MNEMONICS.filter((m) => m.group === g).map((m) => (
              <Link
                key={m.slug}
                href={`/learn/mnemonics/${m.slug}`}
                className="card !p-4 hover:shadow-lg hover:border-secondary border-2 border-transparent transition-all"
              >
                <p className="text-xl font-black text-gray-900 tracking-wide">{m.name}</p>
                <p className="font-semibold text-gray-700">{m.title}</p>
                <p className="text-sm text-gray-500 mt-1">{m.when}</p>
                {m.sort && <p className="text-xs font-bold text-primary mt-2">Includes a scenario drill</p>}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

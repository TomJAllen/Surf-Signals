import Link from "next/link";
import { MNEMONICS, MNEMONIC_GROUPS, type MnemonicGroup } from "@/content/mnemonics";
import TopicTests from "@/components/TopicTests";

const ORDER: MnemonicGroup[] = ["handover", "first-aid", "patrol"];

function Chip({ href, label }: { href?: string; label: string }) {
  return href ? (
    <Link href={href} className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-secondary text-sm font-bold text-gray-800">
      {label}
    </Link>
  ) : (
    <span className="px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-sm font-bold text-gray-400">
      {label} · coming soon
    </span>
  );
}

export default function TestMnemonicsPage() {
  return (
    <TopicTests topic="mnemonics">
      <h2 id="all" className="scroll-mt-24 font-display text-3xl font-extrabold uppercase text-ink">One at a time</h2>
      {ORDER.map((g) => (
        <section key={g} className="space-y-3">
          <h3 className="text-xl font-bold text-ink">{MNEMONIC_GROUPS[g].label}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MNEMONICS.filter((m) => m.group === g).map((m) => {
              const base = `/test/mnemonics/${m.slug}`;
              return (
                <div key={m.slug} className="card !p-4 space-y-3">
                  <div>
                    <p className="text-xl font-black text-gray-900 tracking-wide">{m.name}</p>
                    <p className="text-sm text-gray-600">{m.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Chip href={`${base}?mode=quiz`} label="Quiz" />
                    <Chip href={`${base}?mode=match`} label={m.sort ? "Match a scenario" : "Match"} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </TopicTests>
  );
}

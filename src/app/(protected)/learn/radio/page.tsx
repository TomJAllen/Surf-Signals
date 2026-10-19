import Link from "next/link";
import {
  CALL_SCENARIOS,
  CALL_SIGNS,
  PHONETIC,
  PROWORDS,
  RADIO_DONTS,
  RADIO_TECHNIQUE,
  READABILITY,
} from "@/content/radio";
import { getMnemonic } from "@/content/mnemonics";
import Breadcrumbs from "@/components/Breadcrumbs";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card space-y-3 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

const SECTIONS = [
  ["technique", "Technique"],
  ["making-a-call", "Making a call"],
  ["prowords", "Prowords"],
  ["phonetic", "Phonetic alphabet"],
  ["call-signs", "Call signs"],
  ["four-ps", "The 4 Ps"],
  ["examples", "Example calls"],
  ["donts", "Don'ts"],
];

export default function RadioPage() {
  const fourPs = getMnemonic("four-ps")!;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: "/learn", label: "Learn" }]} />
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Radio</h1>
        <p className="text-gray-600">
          How to use the patrol radio: making a call, prowords, the phonetic alphabet and reporting an
          incident. Call signs and some procedures vary by state, so check your state centre&apos;s SOPs too.
        </p>
        <Link href="/practice/radio" className="btn-primary inline-block">
          Practise radio calls
        </Link>
        <div className="flex flex-wrap gap-2 pt-2">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="px-3 py-1.5 rounded-full bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200">
              {label}
            </a>
          ))}
        </div>
      </header>

      <Section id="technique" title="Good radio technique">
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {RADIO_TECHNIQUE.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </Section>

      <Section id="making-a-call" title="Making a call">
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Say the call sign of the station you want, <strong>twice</strong>.</li>
          <li>Then say <strong>&ldquo;this is&rdquo;</strong> and your own call sign.</li>
          <li>End with <strong>&ldquo;Over&rdquo;</strong> and wait for them to reply &ldquo;Go ahead&rdquo; before giving your message.</li>
          <li>Once you&apos;re talking, you don&apos;t need to repeat call signs on every transmission.</li>
        </ol>
        <p className="font-mono text-sm bg-gray-50 rounded-lg p-3 text-gray-800">
          &ldquo;SurfCom, SurfCom, this is Bondi Patrol. Over.&rdquo;
        </p>
        <h3 className="font-bold text-gray-900 pt-2">Radio checks</h3>
        <p className="text-gray-700 text-sm">Only do a radio check if you think your equipment is faulty. Reply with how well you hear them:</p>
        <dl className="grid sm:grid-cols-3 gap-2">
          {READABILITY.map((r) => (
            <div key={r.term} className="bg-gray-50 rounded-lg p-3">
              <dt className="font-bold text-gray-900">{r.term}</dt>
              <dd className="text-sm text-gray-600">{r.meaning}</dd>
            </div>
          ))}
        </dl>
        <h3 className="font-bold text-gray-900 pt-2">Emergencies</h3>
        <p className="text-gray-700 text-sm">
          For a life-threatening incident, or anything beyond your patrol (such as a mass rescue), clear the channel
          by calling <strong>&ldquo;Rescue, Rescue, Rescue&rdquo;</strong>, then your call to the communication centre. They&apos;ll
          tell all other stations to stand by, and announce to &ldquo;All stations&rdquo; when it&apos;s over.
        </p>
      </Section>

      <Section id="prowords" title="Prowords">
        <p className="text-gray-700 text-sm">Short words with an agreed meaning that keep transmissions short.</p>
        <dl className="divide-y divide-gray-100">
          {PROWORDS.map((p) => (
            <div key={p.word} className="py-2 grid grid-cols-[9rem_1fr] gap-3">
              <dt className="font-bold text-gray-900">{p.word}</dt>
              <dd className="text-gray-700">{p.meaning}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="phonetic" title="Phonetic alphabet">
        <p className="text-gray-700 text-sm">Use it to spell out names, places and codes. Numbers are said one digit at a time (&ldquo;one-eight-five&rdquo;).</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {PHONETIC.map((p) => (
            <div key={p.letter} className="bg-gray-50 rounded-lg px-3 py-2 flex items-baseline gap-2">
              <span className="font-black text-primary w-5">{p.letter}</span>
              <span>
                <span className="font-semibold text-gray-900">{p.word}</span>
                <span className="block text-xs text-gray-500">{p.say}</span>
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="call-signs" title="Standard call signs">
        <dl className="divide-y divide-gray-100">
          {CALL_SIGNS.map((c) => (
            <div key={c.sign} className="py-2 grid grid-cols-[8rem_1fr] gap-3">
              <dt className="font-bold text-gray-900">{c.sign}</dt>
              <dd className="text-gray-700">
                {c.usedFor} <span className="text-gray-500 italic">e.g. {c.example}</span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-gray-500">Your area may use others too. Check your local SOPs.</p>
      </Section>

      <Section id="four-ps" title="Reporting an incident: the 4 Ps">
        <ol className="space-y-2">
          {fourPs.items.map((it, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-primary text-white font-black flex items-center justify-center">{i + 1}</span>
              <span className="text-gray-700"><strong className="text-gray-900">{it.term}:</strong> {it.detail}</span>
            </li>
          ))}
        </ol>
        <Link href="/practice/mnemonics/four-ps?mode=match" className="text-primary font-semibold hover:underline text-sm">
          Practise the 4 Ps →
        </Link>
      </Section>

      <Section id="examples" title="Example calls">
        <div className="space-y-6">
          {CALL_SCENARIOS.map((s) => (
            <div key={s.slug} className="space-y-2">
              <h3 className="font-bold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.situation}</p>
              <div className="space-y-2">
                {s.lines.map((l, i) => (
                  <p
                    key={i}
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      l.from === "you" ? "ml-auto bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {l.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="donts" title="Don'ts">
        <p className="text-gray-700 text-sm">Lots of people listen to radio channels. Never:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {RADIO_DONTS.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </Section>

      <p className="text-xs text-gray-500">
        Source: SLSA Public Safety and Aquatic Rescue Training Manual, 35th ed., Module 3 – Radio Operations.
        Summarised in our own words; example calls use our own details.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SIGNAL_INDEX } from "@/content/signalIndex";
import { shuffle } from "@/lib/shuffle";

// A one-question taste of the identify quiz for the landing page.
// The first question is fixed so server and client render the same thing.

function makeQuestion(answerIndex: number, random: boolean) {
  const answer = SIGNAL_INDEX[answerIndex];
  const others = SIGNAL_INDEX.filter((_, i) => i !== answerIndex);
  const wrong = random ? shuffle(others).slice(0, 2) : [others[4], others[9]];
  const options = random ? shuffle([answer, ...wrong]) : [wrong[0], answer, wrong[1]];
  return { answer, options };
}

export default function SignalTeaser() {
  const [question, setQuestion] = useState(() => makeQuestion(0, false));
  const [picked, setPicked] = useState<string | null>(null);
  const [round, setRound] = useState(1);

  const { answer, options } = question;
  const gotIt = picked === answer.name;
  const isBeach = answer.category === "beach-to-water";

  const next = () => {
    let i = Math.floor(Math.random() * SIGNAL_INDEX.length);
    if (SIGNAL_INDEX[i].name === answer.name) i = (i + 1) % SIGNAL_INDEX.length;
    setQuestion(makeQuestion(i, true));
    setPicked(null);
    setRound((r) => r + 1);
  };

  return (
    <div className="w-full max-w-sm rounded-lg border-[3px] border-ink bg-white shadow-[6px_6px_0_#1C1917]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[3px] border-ink px-4 py-3">
        <h2 className="text-2xl font-extrabold uppercase leading-none text-ink">
          What&apos;s this signal?
        </h2>
        <span className={isBeach ? "chip-beach" : "chip-water"}>
          {isBeach ? "From the beach" : "From the water"}
        </span>
      </div>

      <div className="relative aspect-[5/4] w-full">
        <Image
          key={answer.imageUrl}
          src={answer.imageUrl}
          alt="A lifesaver giving a signal"
          fill
          sizes="384px"
          className="object-contain p-3"
          priority
        />
      </div>

      <div className="space-y-2 border-t-[3px] border-ink p-4" aria-live="polite">
        {options.map((option) => {
          const isAnswer = option.name === answer.name;
          const isPicked = option.name === picked;
          let look = "bg-white hover:bg-secondary";
          if (picked) {
            if (isAnswer) look = "bg-correct text-white";
            else if (isPicked) look = "bg-primary text-white";
            else look = "bg-white text-stone-400 border-stone-300";
          }
          return (
            <button
              key={`${round}-${option.name}`}
              onClick={() => !picked && setPicked(option.name)}
              disabled={!!picked}
              className={`flex w-full items-center justify-between gap-3 rounded-md border-2 border-ink px-3 py-2.5 text-left font-semibold transition-colors ${look}`}
            >
              <span>{option.name}</span>
              {picked && isAnswer && <span aria-hidden="true">✓</span>}
              {picked && isPicked && !isAnswer && <span aria-hidden="true">✗</span>}
            </button>
          );
        })}

        {picked && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="font-semibold text-ink">
              {gotIt ? "Spot on." : "Not quite. Now you know it."}
            </p>
            <div className="flex shrink-0 gap-2">
              <button onClick={next} className="rounded-md border-2 border-ink px-3 py-1.5 font-display text-lg font-bold hover:bg-secondary">
                Another
              </button>
              <Link href="/study/identify" className="rounded-md border-2 border-ink bg-ink px-3 py-1.5 font-display text-lg font-bold text-white hover:bg-stone-700">
                All 14
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

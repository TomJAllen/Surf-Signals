import { isValidElement, type ReactNode } from "react";
import SignalImage from "@/components/SignalImage";
import { type ChoiceQuestion } from "@/components/drills/ChoiceDrill";
import { quizQuestions } from "@/components/drills/MnemonicTrainer";
import { phoneticQuestions, prowordQuestions } from "@/components/drills/RadioPractice";
import { MNEMONICS } from "@/content/mnemonics";
import { PSAR_QUESTIONS } from "@/content/psar";
import { withSeed } from "@/lib/daily";
import { shuffle } from "@/lib/shuffle";
import type { Signal } from "@/types";

function signalQuestion(signal: Signal, all: Signal[]): ChoiceQuestion {
  const others = shuffle(all.filter((s) => s.id !== signal.id)).slice(0, 3);
  return {
    id: `sig-${signal.id}`,
    tag: "Signals",
    prompt: (
      <div className="space-y-3">
        <p>What&apos;s this signal?</p>
        <SignalImage src={signal.imageUrl} alt="A lifesaver giving a signal" size="md" />
      </div>
    ),
    options: shuffle([signal.name, ...others.map((s) => s.name)]),
    answer: signal.name,
    explain: signal.description,
  };
}

function psarQuestion(): ChoiceQuestion {
  const q = shuffle(PSAR_QUESTIONS)[0];
  return {
    id: `psar-${q.id}`,
    tag: `PSAR manual · ${q.topic}`,
    prompt: q.question,
    options: shuffle([q.answer, ...q.wrong]),
    answer: q.answer,
    explain: q.explain,
  };
}

// Today's four questions: a signal, an acronym letter, a radio question and a
// PSAR manual question. Everything is picked and shuffled from a seed made from
// the (Sydney) date, so everyone gets the same set on the same day.
export function dailyQuestions(signals: Signal[], day: string): ChoiceQuestion[] {
  return withSeed(`daily|${day}`, () => {
    const sorted = [...signals].sort((a, b) => a.id.localeCompare(b.id));
    const signal = shuffle(sorted)[0];
    const mnemonic = shuffle(MNEMONICS)[0];
    const mnemonicQ = { ...shuffle(quizQuestions(mnemonic))[0], tag: `Acronyms · ${mnemonic.name}` };
    const radioQ = { ...shuffle([...prowordQuestions(), ...phoneticQuestions()])[0], tag: "Radio" };
    return [signalQuestion(signal, sorted), mnemonicQ, radioQ, psarQuestion()];
  });
}

// A question's words without pictures, for the "today's answers" list
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const text = textOf(node.props.children);
    return node.type === "p" || node.type === "div" ? `${text} ` : text;
  }
  return "";
}

export function plainPrompt(q: ChoiceQuestion): string {
  return textOf(q.prompt).replace(/\s+/g, " ").trim() || "Question";
}

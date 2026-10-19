"use client";

import Link from "next/link";
import ChoiceDrill from "@/components/drills/ChoiceDrill";
import { mixedQuestions } from "@/components/drills/MnemonicTrainer";

export default function MixedMnemonicsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <nav className="text-sm text-gray-500">
        <Link href="/practice" className="hover:underline">Practice</Link> /{" "}
        <Link href="/practice/mnemonics" className="hover:underline">Mnemonics</Link>
      </nav>
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Mixed mnemonics quiz</h1>
        <p className="text-gray-600">12 letters drawn from every mnemonic. A new mix each round.</p>
      </header>
      <ChoiceDrill makeQuestions={() => mixedQuestions(12)} doneLabel="Mixed quiz" />
    </div>
  );
}

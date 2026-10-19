"use client";

import ChoiceDrill from "@/components/drills/ChoiceDrill";
import { mixedQuestions } from "@/components/drills/MnemonicTrainer";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function MixedMnemonicsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Breadcrumbs trail={[{ href: "/test", label: "Test" }, { href: "/test/mnemonics", label: "Mnemonics" }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Mixed mnemonics quiz</h1>
        <p className="text-gray-600">12 letters drawn from every mnemonic. A new mix each round.</p>
      </header>
      <ChoiceDrill makeQuestions={() => mixedQuestions(12)} doneLabel="Mixed quiz" trackAs={{ drill: "mnemonic_mixed" }} />
    </div>
  );
}

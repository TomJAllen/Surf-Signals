import Link from "next/link";
import { REPO_URL, ideaMailto } from "@/content/feedback";

export default function Footer() {
  const mailto = ideaMailto();
  return (
    <footer className="border-t-[3px] border-ink bg-white text-sm text-stone-600">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p>
          Patrol Ready is an independent refresher, not a replacement for club training or the SLSA manual, and
          isn&apos;t affiliated with Surf Life Saving Australia. In an emergency, call 000.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 shrink-0">
          {mailto && (
            <a href={mailto} className="font-semibold text-ink hover:underline">Suggest an idea</a>
          )}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:underline">GitHub</a>
          <Link href="/privacy" className="font-semibold text-ink hover:underline">Privacy</Link>
          <Link href="/terms" className="font-semibold text-ink hover:underline">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

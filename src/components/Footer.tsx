import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-white text-sm text-stone-600">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p>
          Patrol Ready is an independent training aid, not affiliated with Surf Life Saving Australia. In an
          emergency, call 000.
        </p>
        <nav className="flex gap-4 shrink-0">
          <Link href="/privacy" className="font-semibold text-ink hover:underline">Privacy</Link>
          <Link href="/terms" className="font-semibold text-ink hover:underline">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

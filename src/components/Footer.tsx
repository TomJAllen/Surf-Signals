import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/60 text-sm text-gray-500">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p>
          Surf Signals is an independent training aid, not affiliated with Surf Life Saving Australia. In an
          emergency, call 000.
        </p>
        <nav className="flex gap-4 shrink-0">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

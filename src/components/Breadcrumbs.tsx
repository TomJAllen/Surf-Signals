import Link from "next/link";

export interface Crumb {
  href: string;
  label: string;
}

// "← Acronyms" back button for the page one level up, plus the full trail
// (Test › Acronyms) on wider screens. `trail` runs from the top level down.
export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  if (!trail.length) return null;
  const parent = trail[trail.length - 1];
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Link
        href={parent.href}
        className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-white px-3 py-1.5 font-display text-lg font-bold leading-none text-ink shadow-[2px_2px_0_#1C1917] transition-[transform,box-shadow] hover:bg-secondary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5 7 10l5.5 5.5" />
        </svg>
        <span>
          <span className="sr-only">Back to </span>
          {parent.label}
        </span>
      </Link>
      {trail.length > 1 && (
        <ol className="hidden sm:flex items-center gap-1.5 text-sm text-stone-600">
          {trail.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">›</span>}
              <Link href={c.href} className="hover:text-ink hover:underline underline-offset-2">
                {c.label}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

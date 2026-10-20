"use client";

import { REPO_URL, ideaMailto } from "@/content/feedback";
import { track } from "@/lib/analytics";

// "Got an idea?": ask for new tests, corrections and improvements
export default function IdeasCard({ where }: { where: string }) {
  const mailto = ideaMailto();
  return (
    <section aria-labelledby={`ideas-${where}`} className="card space-y-3 border-dashed">
      <h2 id={`ideas-${where}`} className="font-display text-2xl font-extrabold uppercase leading-none text-ink">
        Got an idea?
      </h2>
      <p className="text-stone-700">
        Want a test for something else, spotted a mistake, or think something could work better? I&apos;d love to hear
        it. Patrol Ready is a one-person project, and ideas from patrols decide what gets built next.
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {mailto && (
          <a href={mailto} onClick={() => track("idea_clicked", { where, via: "email" })} className="btn-outline py-2.5">
            Send an idea
          </a>
        )}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("idea_clicked", { where, via: "github" })}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Or help build it on GitHub ↗
        </a>
      </div>
    </section>
  );
}

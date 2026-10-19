import Link from "next/link";
import { CONTACT_EMAIL } from "@/content/legal";

export function LegalPage({
  title,
  effective,
  children,
}: {
  title: string;
  effective: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="font-bold text-xl flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={28} height={28} className="rounded-md" />
            Patrol Ready
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">Effective {effective}</p>
        <div className="legal mt-8 space-y-6 text-gray-800 leading-relaxed">{children}</div>
      </main>
    </div>
  );
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-3 scroll-mt-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

export function Contact() {
  return CONTACT_EMAIL ? (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary font-semibold underline">
      {CONTACT_EMAIL}
    </a>
  ) : (
    <span>the contact email shown on this page once published</span>
  );
}

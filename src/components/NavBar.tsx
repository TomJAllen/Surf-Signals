"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

// Identify and Perform live under /study but belong to Test
function isActiveLink(pathname: string, href: string): boolean {
  return (
    pathname === href ||
    (["/admin", "/learn", "/test"].includes(href) && pathname.startsWith(href)) ||
    (href === "/test" && pathname.startsWith("/study"))
  );
}

export default function NavBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Different nav links for authenticated vs anonymous users
  const navLinks = session
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/learn", label: "Learn" },
        { href: "/test", label: "Test" },
        { href: "/history", label: "History" },
        { href: "/account", label: "Account" },
        ...(session.user.role === "admin"
          ? [{ href: "/admin", label: "Admin" }]
          : []),
      ]
    : [
        { href: "/learn", label: "Learn" },
        { href: "/test", label: "Test" },
      ];

  return (
    <nav className="bg-primary text-white border-b-[3px] border-ink safe-top">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={session ? "/dashboard" : "/"} className="font-display font-bold text-2xl flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" width={30} height={30} className="rounded-md ring-2 ring-ink" />
            Patrol Ready
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md border-2 font-display text-lg font-bold transition-colors ${
                  isActiveLink(pathname, link.href)
                    ? "bg-secondary text-ink border-ink"
                    : "border-transparent hover:bg-primary-dark"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {status === "loading" ? null : session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 px-3 py-1.5 rounded-md font-display text-lg font-bold hover:bg-primary-dark border-2 border-white/40"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-3 py-1.5 rounded-md border-2 border-white font-display text-lg font-bold bg-white text-primary hover:bg-secondary hover:text-ink hover:border-ink"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <MobileMenu navLinks={navLinks} session={session} />
          </div>
        </div>
      </div>
    </nav>
  );
}

function MobileMenu({
  navLinks,
  session,
}: {
  navLinks: { href: string; label: string }[];
  session: ReturnType<typeof useSession>["data"];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on navigation, outside tap, or Escape
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="p-2 rounded-md hover:bg-primary-dark transition-colors"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute right-0 mt-2 w-56 bg-white rounded-lg z-50 border-[3px] border-ink shadow-[5px_5px_0_#1C1917]"
      >
        <div className="py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 font-display text-xl font-bold ${
                isActiveLink(pathname, link.href)
                  ? "bg-secondary text-ink"
                  : "text-ink hover:bg-sand"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-3 font-display text-xl font-bold text-ink hover:bg-sand border-t-2 border-ink mt-1"
            >
              Sign Out
            </button>
          ) : (
            <>
              <div className="border-t-2 border-ink mt-1"></div>
              <Link
                href="/login"
                className="block px-4 py-3 font-display text-xl font-bold text-primary hover:bg-sand"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-3 font-display text-xl font-bold text-ink hover:bg-sand"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

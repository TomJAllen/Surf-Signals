"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Different nav links for authenticated vs anonymous users
  const navLinks = session
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/study/identify", label: "Identify" },
        { href: "/study/perform", label: "Perform" },
        { href: "/history", label: "History" },
      ]
    : [
        { href: "/study/identify", label: "Identify" },
        { href: "/study/perform", label: "Perform" },
      ];

  return (
    <nav className="bg-primary text-white shadow-lg safe-top">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={session ? "/dashboard" : "/"} className="font-bold text-xl flex items-center gap-2">
            <span className="bg-secondary text-gray-900 px-2 py-1 rounded text-sm font-black">SLSA</span>
            Surf Signals
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-secondary text-gray-900"
                    : "hover:bg-primary-dark"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-all border border-white/30"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-secondary text-gray-900 hover:bg-secondary-light transition-all"
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

  return (
    <div className="relative group">
      <button className="p-2 rounded-lg hover:bg-primary-dark transition-colors">
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

      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border-2 border-secondary">
        <div className="py-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-3 text-sm font-medium ${
                pathname === link.href
                  ? "bg-secondary text-gray-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100 mt-1"
            >
              Sign Out
            </button>
          ) : (
            <>
              <div className="border-t border-gray-100 mt-1"></div>
              <Link
                href="/login"
                className="block px-4 py-3 text-sm font-medium text-primary hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
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

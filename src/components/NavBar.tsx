"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/study/identify", label: "Identify" },
    { href: "/study/perform", label: "Perform" },
    { href: "/history", label: "History" },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="font-bold text-xl">
            Surf Signals
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-blue-700"
                    : "hover:bg-blue-500"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {session && (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                Sign Out
              </button>
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
      <button className="p-2 rounded-md hover:bg-blue-500">
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

      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-4 py-2 text-sm ${
                pathname === link.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {session && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

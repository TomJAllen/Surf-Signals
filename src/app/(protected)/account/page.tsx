"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import AnalyticsToggle from "@/components/AnalyticsToggle";
import { clearLocalProgress } from "@/lib/localStorage";
import { track } from "@/lib/analytics";

export default function AccountPage() {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState<"delete" | "signout" | null>(null);
  const [error, setError] = useState("");

  if (!session?.user) return null;

  const deleteAccount = async () => {
    setBusy("delete");
    setError("");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "Couldn't delete your account");
        return;
      }
      track("account_deleted");
      clearLocalProgress();
      await signOut({ callbackUrl: "/?deleted=1" });
    } catch {
      setError("Couldn't delete your account");
    } finally {
      setBusy(null);
    }
  };

  const signOutEverywhere = async () => {
    setBusy("signout");
    await fetch("/api/account/sign-out-everywhere", { method: "POST" });
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-gray-900">Account</h1>

      <section className="card space-y-2">
        <h2 className="text-lg font-bold text-gray-900">Your details</h2>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="text-gray-900">{session.user.name || <span className="text-gray-400">Not set</span>}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd className="text-gray-900 break-all">{session.user.email}</dd>
        </dl>
        <p className="text-xs text-gray-500">To change these, contact us (see the Privacy Policy).</p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Privacy</h2>
        <AnalyticsToggle />
        <p className="text-sm text-gray-600">
          Read the <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> and{" "}
          <Link href="/terms" className="text-primary underline">Terms of Use</Link>.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Download your data</h2>
        <p className="text-sm text-gray-600">
          A copy of everything we hold about you (account details and practice results) as a JSON file.
        </p>
        <a href="/api/account/export" className="btn-secondary inline-block">
          Download my data
        </a>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Security</h2>
        <p className="text-sm text-gray-600">Signed in somewhere you shouldn&apos;t be? Sign out on every device.</p>
        <button onClick={signOutEverywhere} disabled={busy !== null} className="btn-outline disabled:opacity-50">
          {busy === "signout" ? "Signing out…" : "Sign out everywhere"}
        </button>
      </section>

      <section className="card space-y-3 border-2 border-primary/30">
        <h2 className="text-lg font-bold text-primary">Delete account</h2>
        <p className="text-sm text-gray-600">
          Permanently deletes your account and all your practice results. This can&apos;t be undone. You can keep
          using the app without an account.
        </p>
        {error && <p className="text-sm text-primary font-medium">{error}</p>}
        <label className="block text-sm">
          <span className="font-semibold text-gray-700">Your password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-gray-700">Type DELETE to confirm</span>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 focus:outline-none focus:border-primary"
          />
        </label>
        <button
          onClick={deleteAccount}
          disabled={busy !== null || !password || confirmText !== "DELETE"}
          className="w-full py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {busy === "delete" ? "Deleting…" : "Delete my account"}
        </button>
      </section>
    </div>
  );
}

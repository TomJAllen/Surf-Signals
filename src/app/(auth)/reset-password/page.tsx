"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MIN_PASSWORD_LENGTH } from "@/lib/validation";

const inputClass =
  "mt-1 block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

export default function ResetPasswordPage() {
  // The token is in the URL after "#", which browsers never send to the server
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = window.location.hash.slice(1);
    setToken(t);
    // Take it out of the address bar and history
    if (t) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("The passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error ?? "Something went wrong");
      else setDone(true);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-slsa-subtle py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Choose a new password</h1>

        {done ? (
          <div className="card space-y-4 text-center" role="status">
            <p className="text-gray-700">Your password has been changed. You&apos;ve been signed out on all devices.</p>
            <Link href="/login" className="btn-primary w-full block">
              Sign in
            </Link>
          </div>
        ) : token === "" ? (
          <div className="card space-y-3 text-center">
            <p className="text-gray-700">This reset link is incomplete. Copy the whole link and try again.</p>
          </div>
        ) : (
          <form className="card space-y-4" onSubmit={submit}>
            {error && (
              <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-3 rounded-lg font-medium" role="alert">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={200}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700">
                Confirm new password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>
            <button type="submit" disabled={loading || !token} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

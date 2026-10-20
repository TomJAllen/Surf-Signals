"use client";

import { useState } from "react";

const inputClass =
  "mt-1 block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setSentTo(email.trim());
    } catch {
      setError("Something went wrong. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="card space-y-3 text-center" role="status">
        <p className="text-gray-700">
          If <strong>{sentTo}</strong> has an account, we&apos;ve sent it a link to reset your password. It works for an
          hour.
        </p>
        <p className="text-sm text-gray-600">Nothing after a few minutes? Check your spam folder, or try again.</p>
        <button type="button" onClick={() => setSentTo("")} className="font-semibold text-primary hover:underline">
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      {error && (
        <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary" role="alert">
          {error}
        </div>
      )}
      <label className="block text-sm font-semibold text-gray-700">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </label>
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}

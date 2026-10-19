"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import ConsentFields from "./ConsentFields";
import { needsToAcceptTerms } from "@/content/legal";
import { track } from "@/lib/analytics";

// Signed-in users who haven't accepted the current Terms and Privacy Policy
// (existing accounts, or after a policy change) must accept before continuing.
export default function TermsGate() {
  const { data: session, update } = useSession();
  const [consent, setConsent] = useState({ acceptTerms: false, confirmAge: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!session?.user?.id || !needsToAcceptTerms(session.user.termsVersion)) return null;

  const accept = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/account/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consent),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "Something went wrong");
        return;
      }
      track("terms_accepted");
      await update(); // refresh the session so the prompt closes
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <div className="card max-w-md w-full space-y-4">
        <h2 id="terms-title" className="text-xl font-bold text-gray-900">
          We&apos;ve added Terms and a Privacy Policy
        </h2>
        <p className="text-gray-600 text-sm">
          To keep using your account, please read and agree to them. They explain how the app works, what we store
          and how to download or delete your data.
        </p>
        {error && <p className="text-sm text-primary font-medium">{error}</p>}
        <ConsentFields {...consent} onChange={setConsent} />
        <button
          onClick={accept}
          disabled={saving || !consent.acceptTerms || !consent.confirmAge}
          className="btn-primary w-full disabled:opacity-50"
        >
          {saving ? "Saving…" : "Agree and continue"}
        </button>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full text-sm text-gray-500 hover:underline">
          Sign out instead
        </button>
      </div>
    </div>
  );
}

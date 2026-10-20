import type { Metadata } from "next";
import Link from "next/link";
import { emailEnabled } from "@/lib/email";
import { CONTACT_EMAIL } from "@/content/legal";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot your password? · Patrol Ready" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-slsa-subtle py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Forgot your password?</h1>
          {emailEnabled() && (
            <p className="text-gray-600">Enter the email you signed up with and we&apos;ll send you a link to choose a new one.</p>
          )}
        </div>
        {emailEnabled() ? (
          <ForgotPasswordForm />
        ) : (
          <div className="card text-center text-gray-700">
            {CONTACT_EMAIL ? (
              <>
                Email{" "}
                <a href={`mailto:${CONTACT_EMAIL}?subject=Patrol%20Ready%20password%20reset`} className="font-semibold text-primary underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                from the address you signed up with
              </>
            ) : (
              "Contact the app's operator from the address you signed up with"
            )}{" "}
            and we&apos;ll send you a link to reset it.
          </div>
        )}
        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="font-semibold text-primary hover:text-primary-dark">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

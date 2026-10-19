"use client";

import Link from "next/link";
import { MIN_AGE_WITHOUT_GUARDIAN } from "@/content/legal";

interface ConsentFieldsProps {
  acceptTerms: boolean;
  confirmAge: boolean;
  onChange: (next: { acceptTerms: boolean; confirmAge: boolean }) => void;
}

// The two required agreements, used at sign-up and when the terms change.
// Deliberately unticked by default: consent has to be an active choice.
export default function ConsentFields({ acceptTerms, confirmAge, onChange }: ConsentFieldsProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="sr-only">Agreements</legend>
      <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 accent-primary"
          checked={acceptTerms}
          onChange={(e) => onChange({ acceptTerms: e.target.checked, confirmAge })}
        />
        <span>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-primary underline">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-primary underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      <label className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 accent-primary"
          checked={confirmAge}
          onChange={(e) => onChange({ acceptTerms, confirmAge: e.target.checked })}
        />
        <span>
          I&apos;m {MIN_AGE_WITHOUT_GUARDIAN} or older, or a parent or guardian has said I can make an account.
        </span>
      </label>
    </fieldset>
  );
}

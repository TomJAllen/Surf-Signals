// Versions of the legal documents. Bump a version when the document changes in a
// way users need to agree to again; signed-in users are then asked to accept it.
export const TERMS_VERSION = "2026-10-19";
export const PRIVACY_VERSION = "2026-10-20-syd"; // database moved to Sydney
export const LEGAL_EFFECTIVE_DATE = "19 October 2026";
export const PRIVACY_EFFECTIVE_DATE = "20 October 2026";

// Who runs the app and how to reach them. Set NEXT_PUBLIC_CONTACT_EMAIL in Vercel.
export const OPERATOR_NAME = process.env.NEXT_PUBLIC_OPERATOR_NAME || "Tom Allen";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";

// Minimum age to use the app without a parent or guardian's permission
export const MIN_AGE_WITHOUT_GUARDIAN = 16;

export function needsToAcceptTerms(termsVersion: string | null | undefined): boolean {
  return termsVersion !== TERMS_VERSION;
}

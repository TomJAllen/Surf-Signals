import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, Section, Contact } from "@/components/LegalPage";
import { LEGAL_EFFECTIVE_DATE, MIN_AGE_WITHOUT_GUARDIAN, OPERATOR_NAME } from "@/content/legal";

export const metadata: Metadata = { title: "Terms of Use · Patrol Ready" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" effective={LEGAL_EFFECTIVE_DATE}>
      <p>
        These terms apply to your use of Patrol Ready (formerly Surf Signals, the &ldquo;app&rdquo;), a free training app run by{" "}
        {OPERATOR_NAME} in Sydney, Australia (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the app you agree to
        them. Please also read our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
      </p>

      <Section title="1. A training aid, not official training">
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Patrol Ready is an independent study aid. It is <strong>not</strong> produced, endorsed or approved by Surf
            Life Saving Australia (SLSA) or any state centre or club.
          </li>
          <li>
            It does not replace SLSA training, your trainers and assessors, the Public Safety and Aquatic Rescue
            Training Manual, or your state centre&apos;s and club&apos;s procedures. Where anything differs, follow
            those.
          </li>
          <li>
            Content is summarised in our own words and may contain errors or be out of date. Signals, radio procedures
            and call signs can vary by state.
          </li>
          <li>Using the app doesn&apos;t give you any qualification or award.</li>
          <li>
            Camera detection in Perform mode is an approximate aid and can be wrong. It isn&apos;t an assessment.
          </li>
          <li>
            Nothing in the app is medical advice. <strong>In an emergency, call 000.</strong>
          </li>
        </ul>
      </Section>

      <Section title="2. Free to use, with or without an account">
        <p>
          The app is free. You can use Learn and Test without an account. An account is optional and lets you
          save your progress across devices.
        </p>
        <p>
          To create an account you must be {MIN_AGE_WITHOUT_GUARDIAN} or older, or have permission from a parent or
          guardian, who accepts these terms on your behalf.
        </p>
      </Section>

      <Section title="3. Your account">
        <ul className="list-disc pl-6 space-y-1">
          <li>Give accurate details, and use your own email address.</li>
          <li>Keep your password secure and don&apos;t share your account. Tell us if you think it has been misused.</li>
          <li>You can delete your account at any time from your Account page.</li>
        </ul>
      </Section>

      <Section title="4. Acceptable use">
        <p>You must not:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>try to access accounts, data or admin areas that aren&apos;t yours, or bypass any security measure;</li>
          <li>probe, scan or test the app for vulnerabilities without our written permission;</li>
          <li>overload, disrupt or interfere with the app, including with automated scripts or scraping;</li>
          <li>use the app for anything unlawful, or to harass or impersonate anyone.</li>
        </ul>
        <p>
          Found a security issue? Please tell us privately at <Contact /> rather than sharing it publicly.
        </p>
      </Section>

      <Section title="5. Content and intellectual property">
        <ul className="list-disc pl-6 space-y-1">
          <li>The app&apos;s design, text and code are ours or used under licence.</li>
          <li>
            &ldquo;Surf Life Saving&rdquo;, SLSA and their logos are trade marks of Surf Life Saving Australia. Embedded
            demonstration videos belong to their owners and are shown via YouTube.
          </li>
          <li>You may use the app for your own personal training. Please don&apos;t copy and republish its content.</li>
        </ul>
      </Section>

      <Section title="6. Availability and changes">
        <p>
          We provide the app as is and may change, pause or stop it at any time. We try to keep it running and
          accurate but can&apos;t guarantee it will always be available or error-free.
        </p>
      </Section>

      <Section title="7. Liability">
        <p>
          Nothing in these terms excludes rights you have under the Australian Consumer Law that can&apos;t be
          excluded. Otherwise, and to the extent the law allows, we aren&apos;t liable for any loss arising from your
          use of the app or reliance on its content, including in training, assessment, patrol or an emergency.
        </p>
      </Section>

      <Section title="8. Suspension">
        <p>We may suspend or close accounts that break these terms or put the app or other users at risk.</p>
      </Section>

      <Section title="9. Changes to these terms">
        <p>
          If we change these terms in a significant way, we&apos;ll update the date above and ask signed-in users to
          accept the new version before continuing.
        </p>
      </Section>

      <Section title="10. Law and contact">
        <p>
          These terms are governed by the laws of New South Wales, Australia. Questions? Contact {OPERATOR_NAME} at{" "}
          <Contact />.
        </p>
      </Section>
    </LegalPage>
  );
}

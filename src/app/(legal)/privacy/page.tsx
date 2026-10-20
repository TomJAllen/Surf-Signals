import Link from "next/link";
import type { Metadata } from "next";
import { LegalPage, Section, Contact } from "@/components/LegalPage";
import { PRIVACY_EFFECTIVE_DATE, MIN_AGE_WITHOUT_GUARDIAN, OPERATOR_NAME } from "@/content/legal";
import AnalyticsToggle from "@/components/AnalyticsToggle";

export const metadata: Metadata = { title: "Privacy Policy · Patrol Ready" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effective={PRIVACY_EFFECTIVE_DATE}>
      <p>
        Patrol Ready (formerly Surf Signals) is a free training app for surf lifesaving members, run by {OPERATOR_NAME} in Sydney,
        Australia (&ldquo;we&rdquo;, &ldquo;us&rdquo;). This policy explains what personal information we collect,
        why, and what you can do about it. We handle personal information in line with the Australian Privacy
        Principles in the <em>Privacy Act 1988</em> (Cth).
      </p>

      <Section title="The short version">
        <ul className="list-disc pl-6 space-y-1">
          <li>You can use everything in the app without an account. An account just saves your progress.</li>
          <li>If you create one, we store your email, an optional name, a securely hashed password and your practice results.</li>
          <li>Your camera is processed only on your device. Video is never recorded or uploaded.</li>
          <li>We use anonymous analytics to improve the app. They never include your name or email, and you can switch them off.</li>
          <li>We don&apos;t sell your information, show ads, or share it for marketing.</li>
          <li>You can download or delete your data at any time from your Account page.</li>
        </ul>
      </Section>

      <Section title="What we collect">
        <h3 className="font-bold">If you create an account</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Email address</strong>: to sign you in and contact you about your account.</li>
          <li><strong>Name</strong> (optional): shown in the app, e.g. on your dashboard.</li>
          <li><strong>Password</strong>: stored only as a one-way bcrypt hash; we can&apos;t see it.</li>
          <li><strong>Practice results</strong>: for each signal you practise, the signal, the mode (Identify or Perform), whether you got it right, and when.</li>
          <li><strong>Test scores</strong>: for each acronym or radio test you finish, which test (and which acronym or call), your score, mistakes, and when.</li>
          <li><strong>Consent record</strong>: when you agreed to these terms and which version.</li>
        </ul>
        <h3 className="font-bold">If you don&apos;t have an account</h3>
        <p>
          Your practice results are kept only in your browser&apos;s local storage on your device. If you later sign
          up or sign in on that browser, they&apos;re added to your account.
        </p>
        <h3 className="font-bold">Camera (Perform mode)</h3>
        <p>
          If you turn the camera on, your video is analysed entirely in your browser to find your arm positions. It is
          never recorded, stored or sent to us or anyone else. To do this, your browser downloads a pose-detection
          model file from Google&apos;s servers (storage.googleapis.com), so Google receives your IP address for that
          download, as with any website request.
        </p>
        <h3 className="font-bold">Usage analytics</h3>
        <p>
          To understand how the app is used and improve it, we collect anonymous usage data: pages viewed, which
          buttons and links are tapped, how far pages are scrolled, how quickly pages load, which exercises are
          started and finished, scores, the type of device and browser, and an approximate country. Nothing is
          collected on your Account page or on admin pages. We use:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Vercel Web Analytics</strong>: aggregated page views, without cookies.</li>
          <li>
            <strong>PostHog</strong>: anonymous events linked to a random ID stored in your browser (not a cookie).
            We never send your name, email or account ID, nothing you type is captured, there&apos;s no screen
            recording, and IP addresses are discarded.
          </li>
        </ul>
        <p>
          Analytics are switched off if your browser sends a Do Not Track signal, and you can turn them off here at any
          time:
        </p>
        <AnalyticsToggle />
        <h3 className="font-bold">Security and technical data</h3>
        <p>
          Our hosting provider records standard server logs (such as IP address, browser and time of request) to
          keep the service secure and working. To stop password guessing, we keep a short-lived count of sign-in
          attempts per email address and IP address, deleted after 24 hours.
        </p>
        <h3 className="font-bold">Embedded videos</h3>
        <p>
          Official SLS demonstration videos are embedded from YouTube in privacy-enhanced mode
          (youtube-nocookie.com) and only load when you choose to watch one. YouTube&apos;s own privacy policy then
          applies.
        </p>
      </Section>

      <Section title="Why we use it">
        <ul className="list-disc pl-6 space-y-1">
          <li>To provide the app: sign-in, saving and showing your progress.</li>
          <li>To keep it secure and prevent misuse.</li>
          <li>To improve it, using anonymous analytics.</li>
          <li>To contact you about your account or important changes to these policies.</li>
        </ul>
        <p>We don&apos;t use your information for advertising and we don&apos;t sell it.</p>
      </Section>

      <Section title="Who we share it with">
        <p>Only the service providers that run the app for us, under their own security and privacy commitments:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Supabase</strong>: database for accounts and practice results, hosted in Australia (Sydney).</li>
          <li><strong>Vercel</strong>: website hosting, with our servers in Sydney; also Vercel Web Analytics and image storage.</li>
          <li><strong>PostHog</strong>: anonymous analytics, hosted in the United States.</li>
        </ul>
        <p>
          Your account and practice results are stored in Australia. Anonymous analytics are processed by PostHog
          in the United States, and some of Vercel&apos;s services may process data overseas. We choose providers with strong security practices and
          only share what each needs. We may also disclose information if required by law.
        </p>
      </Section>

      <Section title="How long we keep it">
        <ul className="list-disc pl-6 space-y-1">
          <li>Account and practice data: until you delete your account. It&apos;s then deleted straight away, apart from routine backups, which expire on their normal schedule.</li>
          <li>Sign-in rate-limit records: 24 hours.</li>
          <li>Anonymous analytics: kept to understand trends over time; they can&apos;t be linked back to you.</li>
        </ul>
      </Section>

      <Section title="Keeping it secure">
        <p>
          Passwords are hashed with bcrypt, all connections are encrypted, sign-in attempts are rate-limited, access
          to the database and admin tools is restricted, and we only collect what the app needs. No system is
          perfectly secure. If a data breach is likely to cause you serious harm, we&apos;ll tell you and, where
          required, the Office of the Australian Information Commissioner (OAIC).
        </p>
      </Section>

      <Section title="Young people">
        <p>
          Many surf lifesaving members are under 18. You can use the app without an account and without giving us any
          personal information. To create an account you must be {MIN_AGE_WITHOUT_GUARDIAN} or older, or have a
          parent or guardian&apos;s permission. We collect only the minimum needed, and never use it for advertising.
          A parent or guardian can contact us to access or delete their child&apos;s account.
        </p>
      </Section>

      <Section title="Your choices and rights">
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Access:</strong> download all your data from your <Link href="/account" className="text-primary underline">Account</Link> page.</li>
          <li><strong>Correction:</strong> contact us to correct your details.</li>
          <li><strong>Deletion:</strong> delete your account and all its data from your Account page at any time.</li>
          <li><strong>Analytics:</strong> switch anonymous analytics off (above, or on your Account page).</li>
        </ul>
        <p>
          If you&apos;re in the EU or UK, you also have rights under the GDPR, including to object to processing and to
          complain to your local data protection authority.
        </p>
      </Section>

      <Section title="Contact and complaints">
        <p>
          For privacy questions, requests or complaints, contact {OPERATOR_NAME} at <Contact />. We aim to reply
          within 30 days. If you&apos;re not satisfied with our response, you can complain to the OAIC at{" "}
          <a href="https://www.oaic.gov.au" className="text-primary underline">oaic.gov.au</a>.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we make significant changes, we&apos;ll update the date above and ask signed-in users to review and accept
          the new version.
        </p>
      </Section>

      <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
        Patrol Ready is an independent app and is not affiliated with or endorsed by Surf Life Saving Australia.
        See also our <Link href="/terms" className="underline">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}

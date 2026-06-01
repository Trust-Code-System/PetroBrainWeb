import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How PetroBrain collects, uses and protects personal data. Placeholder template — to be finalised by counsel.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro="How we handle personal data on this marketing site and in the course of providing PetroBrain."
    >
      <p>
        <strong>[PLACEHOLDER]</strong> This policy is a structural template. Replace every section
        below with counsel-approved language reflecting your actual data practices and the
        regulations that apply to you (e.g. the Nigeria Data Protection Act and, where relevant,
        GDPR).
      </p>

      <h2>1. Who we are</h2>
      <p>
        [PLACEHOLDER — legal entity name, registered address, and the data-controller contact for
        privacy matters.]
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li><strong>Information you provide</strong> — e.g. name, work email, company, role, country and your message when you request a demo or unlock an MRV report.</li>
        <li><strong>Usage data</strong> — privacy-respecting, cookieless analytics via Plausible (no personal profiling, no cross-site tracking).</li>
        <li><strong>[PLACEHOLDER]</strong> — any other categories you actually collect.</li>
      </ul>

      <h2>3. How we use it</h2>
      <ul>
        <li>To respond to demo requests and prepare your walkthrough.</li>
        <li>To send the MRV readiness report you requested.</li>
        <li>To improve the website and understand aggregate usage.</li>
        <li>[PLACEHOLDER — any additional purposes, each with its lawful basis.]</li>
      </ul>

      <h2>4. Lawful basis</h2>
      <p>[PLACEHOLDER — set out the lawful basis for each purpose (e.g. consent, legitimate interests, contract).]</p>

      <h2>5. Sharing &amp; sub-processors</h2>
      <p>
        We share data only with the service providers needed to operate. See our{" "}
        <a href="/security">security &amp; sub-processor information</a>. [PLACEHOLDER — confirm the
        actual list and safeguards.]
      </p>

      <h2>6. International transfers</h2>
      <p>[PLACEHOLDER — describe any cross-border transfers and the safeguards used.]</p>

      <h2>7. Retention</h2>
      <p>[PLACEHOLDER — how long each category is kept and the criteria used.]</p>

      <h2>8. Security</h2>
      <p>
        We apply technical and organisational measures described on our{" "}
        <a href="/security">security page</a>. No method of transmission or storage is perfectly
        secure. [PLACEHOLDER — confirm.]
      </p>

      <h2>9. Your rights</h2>
      <p>[PLACEHOLDER — list applicable rights (access, rectification, erasure, objection, portability) and how to exercise them.]</p>

      <h2>10. Cookies &amp; analytics</h2>
      <p>
        This site uses Plausible, a cookieless analytics tool, and does not set advertising cookies.
        [PLACEHOLDER — confirm and add a cookie table if any cookies are introduced.]
      </p>

      <h2>11. Children</h2>
      <p>[PLACEHOLDER — this service is not directed at children; confirm age handling.]</p>

      <h2>12. Changes</h2>
      <p>We may update this policy; the effective date above will change accordingly.</p>
    </LegalLayout>
  );
}

import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing use of the PetroBrain website and service. Placeholder template — to be finalised by counsel.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro="The terms governing your use of this website and, where applicable, the PetroBrain service."
    >
      <p>
        <strong>[PLACEHOLDER]</strong> Structural template only. Replace with counsel-approved
        terms reflecting your jurisdiction, commercial model and the actual service agreement.
      </p>

      <h2>1. Acceptance</h2>
      <p>[PLACEHOLDER — by using the site/service you agree to these terms.]</p>

      <h2>2. The service</h2>
      <p>
        PetroBrain is an AI-native intelligence platform for oil &amp; gas. [PLACEHOLDER — describe
        what is and isn’t included; product terms may be governed by a separate master agreement.]
      </p>

      <h2>3. Acceptable use</h2>
      <ul>
        <li>Don’t misuse the service, attempt to breach security, or use it unlawfully.</li>
        <li>[PLACEHOLDER — additional restrictions.]</li>
      </ul>

      <h2>4. Not a substitute for professional judgement</h2>
      <p>
        <strong>Important.</strong> PetroBrain is decision-support, not a decision-maker. Its
        outputs are informational and must be verified by a competent person against the controlling
        documents before any safety-critical action. Nothing here is engineering, legal or
        professional advice. [PLACEHOLDER — confirm liability framing with counsel.]
      </p>

      <h2>5. Intellectual property</h2>
      <p>[PLACEHOLDER — ownership of the platform, content and feedback.]</p>

      <h2>6. Customer data</h2>
      <p>
        You retain ownership of your data. Processing is governed by our{" "}
        <a href="/legal/dpa">Data Processing Agreement</a>. [PLACEHOLDER — confirm.]
      </p>

      <h2>7. Fees</h2>
      <p>[PLACEHOLDER — commercial terms, or a pointer to the order form / MSA.]</p>

      <h2>8. Disclaimers &amp; warranties</h2>
      <p>[PLACEHOLDER — “as is” / warranty disclaimers, to the extent permitted by law.]</p>

      <h2>9. Limitation of liability</h2>
      <p>[PLACEHOLDER — liability caps and exclusions, drafted by counsel.]</p>

      <h2>10. Termination</h2>
      <p>[PLACEHOLDER — how either party may terminate and the effects.]</p>

      <h2>11. Governing law</h2>
      <p>[PLACEHOLDER — governing law and dispute-resolution venue.]</p>

      <h2>12. Changes</h2>
      <p>We may update these terms; the effective date above will change accordingly.</p>
    </LegalLayout>
  );
}

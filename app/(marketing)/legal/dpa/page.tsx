import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { Banner } from "@/components/ui/Banner";

export const metadata: Metadata = {
  title: "Data Processing Agreement",
  description: "How PetroBrain processes customer data as processor, including the anonymized-aggregate clause. Placeholder template — to be finalised by counsel.",
  alternates: { canonical: "/legal/dpa" },
};

export default function DpaPage() {
  return (
    <LegalLayout
      title="Data Processing Agreement (DPA)"
      intro="The terms under which PetroBrain processes customer data on your behalf as a processor."
    >
      <p>
        <strong>[PLACEHOLDER]</strong> Structural template only. A DPA is a binding contract with
        specific regulatory requirements — it must be drafted and reviewed by qualified legal
        counsel for your jurisdiction(s) before use.
      </p>

      <h2>1. Definitions</h2>
      <p>[PLACEHOLDER — controller, processor, sub-processor, personal data, processing, etc.]</p>

      <h2>2. Roles &amp; scope</h2>
      <p>
        The customer is the controller; PetroBrain is the processor and processes customer data only
        to provide the service and on documented instructions. [PLACEHOLDER — confirm.]
      </p>

      <h2>3. Customer data ownership</h2>
      <p>
        The customer owns its data. PetroBrain claims no ownership of customer data and processes it
        solely within the customer’s tenant and on the customer’s behalf.
      </p>

      <h2>4. Processing instructions &amp; confidentiality</h2>
      <p>[PLACEHOLDER — scope of instructions; personnel confidentiality obligations.]</p>

      <h2>5. Security measures</h2>
      <p>
        Technical and organisational measures are described on our{" "}
        <a href="/security">security page</a> and to be annexed here. [PLACEHOLDER — attach the
        measures schedule.]
      </p>

      <h2>6. Sub-processors</h2>
      <p>
        Current sub-processors are listed on the <a href="/security">security page</a>. We will give
        notice of material changes and an opportunity to object. [PLACEHOLDER — confirm mechanism.]
      </p>

      <h2>7. International transfers</h2>
      <p>[PLACEHOLDER — transfer mechanisms and safeguards.]</p>

      <h2>8. Data-subject requests &amp; breach notification</h2>
      <p>[PLACEHOLDER — assistance with requests; breach-notification timelines and process.]</p>

      <h2>9. Audit</h2>
      <p>[PLACEHOLDER — audit rights and how they’re exercised.]</p>

      <h2>10. Return &amp; deletion</h2>
      <p>[PLACEHOLDER — return/deletion of customer data on termination.]</p>

      <h2>11. Anonymized &amp; aggregated data</h2>
      <Banner variant="danger" title="DRAFT CLAUSE — must be drafted and reviewed by counsel">
        This clause is the legal foundation for building anonymized benchmarks. Get it right: a
        sloppy version erodes customer trust and may be unenforceable. The text below is a
        placeholder sketch of intent only — not binding language.
      </Banner>
      <p>
        <strong>[DRAFT — intent only]</strong> Subject to the customer’s consent and the safeguards
        below, the customer grants PetroBrain a limited licence to create and use{" "}
        <strong>anonymized and aggregated</strong> data derived from customer data to build
        benchmarks and improve the service, provided that:
      </p>
      <ul>
        <li>Data is <strong>irreversibly de-identified and aggregated</strong> so it cannot reasonably be re-identified or attributed to the customer, any individual, or any specific asset or well.</li>
        <li>No raw customer data, and no customer-identifying or asset-identifying information, is disclosed.</li>
        <li>Aggregation thresholds (e.g. minimum number of contributors per benchmark) prevent re-identification by inference.</li>
        <li>The customer may <strong>opt out</strong> of contributing to aggregates without losing access to the service.</li>
        <li>[PLACEHOLDER — governing-law specifics, survival, and audit of de-identification, per counsel.]</li>
      </ul>

      <h2>12. Term</h2>
      <p>[PLACEHOLDER — duration, and which clauses survive termination.]</p>
    </LegalLayout>
  );
}

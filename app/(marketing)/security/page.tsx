import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { TechBackground } from "@/components/ui/TechBackground";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security & compliance",
  description:
    "PetroBrain security and compliance: data residency options, encryption, IEC 62443 / ISO 27001 alignment, read-only OT posture, tenant isolation, audit logging, sub-processors, and data rights governed by our DPA.",
  alternates: { canonical: "/security" },
};

const residency = [
  {
    title: "On-prem / sovereign",
    body: "Deploy the operational tier entirely within your own data centre or national boundary. For operators with data-sovereignty obligations, residency is a deployment choice — not a special case.",
  },
  {
    title: "In-region cloud",
    body: "Hosted in the cloud region you choose; your data stays in that region. Suited to operators who want managed hosting without leaving their jurisdiction.",
  },
  {
    title: "Hybrid (default)",
    body: "General knowledge and public data in the cloud tier; your documents, historian replica, calculation engine and operational data on-prem behind your OT firewall.",
  },
];

const encryption = [
  { k: "In transit", v: "TLS 1.2+ for all connections, with modern cipher suites. No plaintext transport." },
  { k: "At rest", v: "AES-256 encryption for stored data and backups." },
  { k: "Key management", v: "Keys managed in a dedicated key-management service; rotation supported. Customer-managed keys available for on-prem deployments." },
  { k: "Secrets", v: "No secrets in client code. Server-only credentials; market-feed keys held on the customer’s behalf, never exposed to the browser." },
];

const isolation = [
  "Each customer runs in a dedicated, logically isolated tenant — data is never commingled across customers.",
  "Your operational data is processed on your behalf, within your tenant; it is not used to train shared or third-party models.",
  "Role-based access control governs who can see and do what, with least-privilege defaults.",
];

const auditing = [
  "Every answer is reconstructable — traceable to the documents it drew on and the figures it cited.",
  "Access, administrative actions and configuration changes are logged.",
  "Logs are exportable to support your own audit, SIEM and review processes.",
];

const subProcessors = [
  { name: "[Cloud infrastructure provider]", purpose: "Hosting & compute for the cloud knowledge tier", region: "[Customer-selected region]" },
  { name: "[LLM/model provider]", purpose: "Language reasoning (no operational data retained for training)", region: "[Region]" },
  { name: "[Email / notification provider]", purpose: "Transactional email (e.g. demo requests)", region: "[Region]" },
  { name: "[Analytics — Plausible]", purpose: "Privacy-respecting, cookieless web analytics", region: "[EU]" },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="grid" />
        <Container className="relative py-16 lg:py-24">
          <Eyebrow>Security &amp; compliance</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-primary">
            Most of your security questionnaire, answered up front.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
            PetroBrain handles safety-critical operational data, so security isn’t a feature — it’s
            the foundation. Here’s where your data lives, how it’s protected, and the boundaries the
            system operates within. Every claim below is stated precisely: we say “alignment” where
            we’ve designed to a standard, and “certified” only where a certificate has been issued.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge tone="info" dot>Read-only into OT</Badge>
            <Badge tone="safe" dot>Tenant-isolated</Badge>
            <Badge tone="accent" dot>You own your data</Badge>
          </div>
        </Container>
      </section>

      {/* Data residency */}
      <Section surface="1" bordered>
        <Eyebrow>Data residency</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Choose where your data lives.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          Residency is a configuration, not a renegotiation. Three deployment shapes, depending on
          your sovereignty and IT requirements:
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {residency.map((r) => (
            <div key={r.title} className="rounded-lg border border-border-subtle bg-surface-2 p-6">
              <h3 className="text-lg font-semibold text-primary">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{r.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Encryption */}
      <Section surface="base" bordered>
        <Eyebrow>Encryption</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Encrypted in transit and at rest.
        </h2>
        <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-2">
          {encryption.map((e) => (
            <div key={e.k} className="bg-surface-1 p-6">
              <dt className="font-mono text-xs uppercase tracking-wider text-accent">{e.k}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-secondary">{e.v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* Standards alignment */}
      <Section surface="1" bordered>
        <Eyebrow>Standards</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          IEC 62443 &amp; ISO/IEC 27001 alignment.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
            <h3 className="text-lg font-semibold text-primary">IEC 62443</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Our security design follows the IEC 62443 framework for industrial automation and
              control-system security — segmentation, least privilege, and a read-only posture
              toward OT.
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
            <h3 className="text-lg font-semibold text-primary">ISO/IEC 27001</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Our information-security management practices are designed to align with ISO/IEC
              27001 — risk management, access control, and operational security controls.
            </p>
          </div>
        </div>
        <Banner variant="info" title="Alignment, stated honestly" className="mt-6">
          “Alignment” describes how we’ve designed and operate against these standards. It is not a
          claim of certification. Where a formal certification or audit report (e.g. ISO 27001
          certificate, SOC 2) has been issued, we will say so explicitly and make it available under
          NDA. Ask us for current status.
        </Banner>
      </Section>

      {/* OT air-gap posture */}
      <Section surface="base" bordered>
        <div className="rounded-2xl border border-accent/40 bg-surface-1 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>OT posture</Eyebrow>
            <Badge tone="accent" dot>No control path</Badge>
          </div>
          <h2 className="mt-4 max-w-2xl text-h2 font-semibold text-primary">
            Read-only toward OT. It never actuates anything.
          </h2>
          <p className="mt-4 max-w-2xl text-secondary">
            PetroBrain reads from a read-only historian/SCADA replica. There is no write path from
            the system into your control environment — it cannot set a value, open a valve, or move
            a single piece of plant. Data flows one way, out of OT, across a segmented boundary.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="rounded-lg border border-border-subtle bg-surface-2 p-5">
              <h3 className="text-base font-semibold text-primary">Read-only replica</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                It consumes a replica of historian/SCADA data — not a live connection to controllers.
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-surface-2 p-5">
              <h3 className="text-base font-semibold text-primary">One-way data flow</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Operational data moves out of OT for reasoning; nothing flows back as a command.
              </p>
            </div>
            <div className="rounded-lg border border-border-subtle bg-surface-2 p-5">
              <h3 className="text-base font-semibold text-primary">Segmented boundary</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                The operational tier sits behind your OT firewall, isolated from the control network.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Tenant isolation + Audit logging */}
      <Section surface="1" bordered>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Tenant isolation</Eyebrow>
            <h2 className="mt-3 text-h2 font-semibold text-primary">Your data stays yours.</h2>
            <ul className="mt-6 space-y-3">
              {isolation.map((i) => (
                <li key={i} className="flex gap-3 text-sm text-secondary">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span className="leading-relaxed">{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow>Audit logging</Eyebrow>
            <h2 className="mt-3 text-h2 font-semibold text-primary">Provable, not just plausible.</h2>
            <ul className="mt-6 space-y-3">
              {auditing.map((i) => (
                <li key={i} className="flex gap-3 text-sm text-secondary">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <span className="leading-relaxed">{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Sub-processors */}
      <Section surface="base" bordered>
        <Eyebrow>Sub-processors</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Who else touches the data.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          The third parties that may process data on our behalf, and why. We notify customers of
          material changes to this list.
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-2 text-left text-xs uppercase tracking-wider text-faint">
                <th className="px-4 py-3 font-medium">Sub-processor</th>
                <th className="px-4 py-3 font-medium">Purpose</th>
                <th className="px-4 py-3 font-medium">Region</th>
              </tr>
            </thead>
            <tbody>
              {subProcessors.map((s) => (
                <tr key={s.name} className="border-b border-border-subtle last:border-0 bg-surface-1">
                  <td className="px-4 py-3 font-medium text-primary">{s.name}</td>
                  <td className="px-4 py-3 text-secondary">{s.purpose}</td>
                  <td className="px-4 py-3 text-secondary">{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-faint">
          Placeholder list — replace bracketed entries with the actual sub-processors and regions
          before publishing.
        </p>
      </Section>

      {/* Data rights & residency */}
      <Section surface="1" bordered>
        <Eyebrow>Data rights &amp; residency</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          You own your data. We’re explicit about every other case.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
            <Badge tone="safe">Your data</Badge>
            <h3 className="mt-3 text-lg font-semibold text-primary">You own it</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Your operational data is yours. PetroBrain processes it only within your tenant and on
              your behalf — never sold, never used to train shared models.
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
            <Badge tone="info">Market feeds</Badge>
            <h3 className="mt-3 text-lg font-semibold text-primary">Your licence, on your behalf</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              If you connect a paid market feed (e.g. Platts, Argus), PetroBrain reasons over it
              under <em>your</em> subscription and licence. We don’t resell anyone’s data.
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
            <Badge tone="accent">Aggregates</Badge>
            <h3 className="mt-3 text-lg font-semibold text-primary">Governed by the DPA</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Any use of anonymized, aggregated data to build benchmarks is governed by our Data
              Processing Agreement — with de-identification guarantees and opt-out terms.
            </p>
          </div>
        </div>

        {/* DPA download slot */}
        <div className="mt-8 flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface-2 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Data Processing Agreement</h3>
            <p className="mt-1 text-sm text-secondary">
              The full DPA, including the anonymized-aggregate clause and your opt-out rights.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/legal/dpa" variant="secondary">
              Read the DPA
            </Button>
            {/* TODO(dpa): replace with the real signed-PDF URL once available. */}
            <Button href="/legal/dpa" aria-label="Download the DPA as PDF (coming soon)">
              Download PDF
            </Button>
          </div>
        </div>
        <p className="mt-3 text-xs text-faint">
          Placeholder link — point “Download PDF” at the hosted DPA document when ready.
        </p>
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="contour" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
            Bring your security team to the demo.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            We’ll walk your IT and OT reviewers through the architecture, the controls, and the
            data-rights model — and answer the questionnaire live.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href={ctas.primary.href} size="lg">
              {ctas.primary.label}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

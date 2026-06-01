import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge, StageBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { CitationChip } from "@/components/ui/CitationChip";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { Banner } from "@/components/ui/Banner";
import { TechBackground } from "@/components/ui/TechBackground";
import { SelectShowcase } from "@/components/styleguide/SelectShowcase";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "PetroBrain design-system tokens and UI primitives.",
  robots: { index: false, follow: false },
};

/* ---------- local helpers (styleguide-only) ---------- */

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="py-10 first:pt-0">
      <div className="mb-5">
        <h2 className="text-h3 font-semibold text-primary">{title}</h2>
        {hint && <p className="mt-1 text-sm text-secondary">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Swatch({ name, value, className }: { name: string; value: string; className: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-border-subtle">
      <div className={`h-16 ${className}`} />
      <div className="bg-surface-1 px-3 py-2">
        <p className="text-xs font-medium text-primary">{name}</p>
        <p className="font-mono text-[0.7rem] text-faint">{value}</p>
      </div>
    </div>
  );
}

/* The four real /intelligence capability cards — exact stage labels from the docs. */
const capabilities: {
  title: string;
  blurb: string;
  badges: React.ReactNode;
}[] = [
  {
    title: "Emissions & MRV Intelligence",
    blurb: "Your strongest card. Customer data + public satellite methane + the NUPRC framework.",
    badges: <StageBadge stage="live" />,
  },
  {
    title: "Asset Intelligence",
    blurb: "Reason over your own field, well and production reality.",
    badges: (
      <>
        <StageBadge stage="live" note="your data" />
        <StageBadge stage="expanding" note="West African benchmarks" />
      </>
    ),
  },
  {
    title: "Market Reasoning",
    blurb: "Reason over public balances. Never claim to own market data we don't.",
    badges: (
      <>
        <StageBadge stage="live" note="public data: EIA, OPEC, IEA, rig counts" />
        <StageBadge stage="roadmap" note="connect your Platts/Argus feed (on request)" />
      </>
    ),
  },
  {
    title: "Cost Intelligence",
    blurb: "Honest about the Stage-3 trajectory.",
    badges: (
      <>
        <StageBadge stage="live" note="your data" />
        <StageBadge stage="expanding" note="West African cost benchmarks building" />
      </>
    ),
  },
];

export default function StyleguidePage() {
  return (
    <>
      {/* Hero with the technical motif behind it */}
      <div className="relative border-b border-border-subtle">
        <TechBackground variant="contour" />
        <Container className="relative py-16">
          <Badge tone="accent">Design system</Badge>
          <h1 className="mt-4 text-display font-semibold text-primary">PetroBrain styleguide</h1>
          <p className="mt-4 max-w-prose text-secondary">
            Tokens and primitives for the &ldquo;dark &amp; technical&rdquo; industrial
            control-room aesthetic. Everything below is reused site-wide. No page is built
            yet — this is the foundation.
          </p>
        </Container>
      </div>

      <Section surface="base">
        <Block title="Colour — base & surfaces" hint="Deep-slate base with three layered surfaces for depth.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch name="base" value="#0B0E13" className="bg-base" />
            <Swatch name="surface-1" value="#11151C" className="bg-surface-1" />
            <Swatch name="surface-2" value="#171C25" className="bg-surface-2" />
            <Swatch name="surface-3" value="#1E2632" className="bg-surface-3" />
          </div>
        </Block>

        <Block title="Colour — accent & semantic" hint="ONE accent (safety-amber). Semantic colours used sparingly.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Swatch name="accent" value="#FF7A00" className="bg-accent" />
            <Swatch name="safe" value="#1FB85C" className="bg-safe" />
            <Swatch name="warn" value="#FFB020" className="bg-warn" />
            <Swatch name="danger" value="#FF4D4D" className="bg-danger" />
            <Swatch name="info" value="#3B9EFF" className="bg-info" />
          </div>
        </Block>

        <Block title="Colour — cool-grey neutral scale" hint="Text & borders, tuned for AA contrast on dark.">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
            {[
              ["50", "#F5F7FA", "bg-grey-50"],
              ["100", "#E6EAF0", "bg-grey-100"],
              ["200", "#CCD3DE", "bg-grey-200"],
              ["300", "#AEB7C5", "bg-grey-300"],
              ["400", "#8B95A6", "bg-grey-400"],
              ["500", "#6B7585", "bg-grey-500"],
              ["600", "#525B6B", "bg-grey-600"],
              ["700", "#3A4250", "bg-grey-700"],
              ["800", "#262D38", "bg-grey-800"],
              ["900", "#171C25", "bg-grey-900"],
            ].map(([n, v, c]) => (
              <Swatch key={n} name={`grey-${n}`} value={v as string} className={c as string} />
            ))}
          </div>
        </Block>

        <Block title="Typography" hint="Inter for UI/body, JetBrains Mono for technical proof.">
          <div className="space-y-4 rounded-lg border border-border-subtle bg-surface-1 p-6">
            <p className="text-display font-semibold text-primary">Display / hero</p>
            <p className="text-h1 font-semibold text-primary">Heading 1</p>
            <p className="text-h2 font-semibold text-primary">Heading 2</p>
            <p className="text-h3 font-semibold text-primary">Heading 3</p>
            <p className="text-primary">Body — primary text colour for paragraphs and key copy.</p>
            <p className="text-secondary">Secondary — supporting copy and descriptions.</p>
            <p className="text-muted">Muted — captions and non-essential detail.</p>
            <p className="font-mono text-sm text-accent">mono · breakeven = fixed_cost / (price − variable_cost)</p>
          </div>
        </Block>
      </Section>

      <Section surface="1" bordered>
        <Block title="Buttons" hint="primary / secondary / ghost, three sizes. Render as <button> or <Link> (href).">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Book a demo</Button>
              <Button variant="secondary">MRV readiness check</Button>
              <Button variant="ghost">Learn more</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
        </Block>

        <Block title="Badge & StageBadge" hint="StageBadge is mandatory site-wide. Three canonical stages, fixed colours — never relabel.">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge>neutral</Badge>
              <Badge tone="accent">accent</Badge>
              <Badge tone="safe">safe</Badge>
              <Badge tone="warn">warn</Badge>
              <Badge tone="danger">danger</Badge>
              <Badge tone="info">info</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <StageBadge stage="live" />
              <StageBadge stage="expanding" />
              <StageBadge stage="roadmap" />
            </div>
            <div className="flex flex-wrap gap-2">
              <StageBadge stage="live" note="your data" />
              <StageBadge stage="expanding" note="West African benchmarks" />
            </div>
          </div>
        </Block>

        <Block title="Capability cards" hint="The four real /intelligence cards, with their exact stage labels — proof the badge system works.">
          <div className="grid gap-4 sm:grid-cols-2">
            {capabilities.map((c) => (
              <Card key={c.title}>
                <CardTitle>{c.title}</CardTitle>
                <CardBody>{c.blurb}</CardBody>
                <div className="mt-4 flex flex-wrap gap-2">{c.badges}</div>
              </Card>
            ))}
          </div>
        </Block>

        <Block
          title="Select & MultiSelect"
          hint="Themed listbox controls — no native <select> anywhere. Keyboard: ↑/↓, Home/End, Enter/Space, Esc, type-ahead. Click in and open to see the panel, focus and active (amber) states."
        >
          <SelectShowcase />
        </Block>
      </Section>

      <Section surface="base" bordered>
        <Block title="Citation & confidence" hint="Technical-proof primitives: every figure is sourced; every answer is calibrated.">
          <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-surface-1 p-6">
            <div className="flex flex-wrap gap-2">
              <CitationChip source="EIA · Short-Term Energy Outlook" />
              <CitationChip source="OPEC MOMR · May 2026" />
              <CitationChip source="Baker Hughes Rig Count" href="https://rigcount.bakerhughes.com/" />
            </div>
            <div className="flex flex-col gap-3">
              <ConfidenceLabel level="high" />
              <ConfidenceLabel level="medium" note="Partial maintenance history connected" />
              <ConfidenceLabel level="low" note="No field-level production data connected" />
            </div>
          </div>
        </Block>

        <Block title="Banners" hint="Safety / honesty callouts. danger & warn are the verification messages; info carries the honesty box.">
          <div className="space-y-4">
            <Banner variant="danger" title="Verify before acting">
              PetroBrain assists engineering judgement — it does not replace it. Confirm every
              safety-critical value (torque, pressure, kill-sheet figures) against the controlling
              document before acting.
            </Banner>
            <Banner variant="warn" title="Illustrative data">
              The figures in this mock are illustrative, not production data. PetroBrain never shows
              market data it doesn&apos;t actually have as if it owns it.
            </Banner>
            <Banner variant="info" title="The honesty box">
              PetroBrain will tell you what it can and can&apos;t see. It reasons over the data you
              have and the public data that exists — and it never invents a number to look more
              complete.
            </Banner>
          </div>
        </Block>
      </Section>

      <Section surface="1" bordered>
        <Block title="Technical background motif" hint="Decorative, very low opacity, edge-masked. Respects prefers-reduced-motion.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative h-48 overflow-hidden rounded-lg border border-border-subtle bg-base">
              <TechBackground variant="contour" />
              <span className="absolute bottom-3 left-4 font-mono text-xs text-faint">variant=&quot;contour&quot;</span>
            </div>
            <div className="relative h-48 overflow-hidden rounded-lg border border-border-subtle bg-base">
              <TechBackground variant="grid" />
              <span className="absolute bottom-3 left-4 font-mono text-xs text-faint">variant=&quot;grid&quot;</span>
            </div>
          </div>
        </Block>

        <Block title="Elevation & focus" hint="Dark-native shadows; visible keyboard focus ring on every interactive element.">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-surface-1 p-6 shadow-elev-1 text-sm text-secondary">shadow-elev-1</div>
            <div className="rounded-lg bg-surface-1 p-6 shadow-elev-2 text-sm text-secondary">shadow-elev-2</div>
            <div className="rounded-lg bg-surface-1 p-6 shadow-elev-3 text-sm text-secondary">shadow-elev-3</div>
          </div>
          <p className="mt-4 text-sm text-secondary">
            Tab through the buttons and links above to see the focus ring.
          </p>
        </Block>
      </Section>
    </>
  );
}

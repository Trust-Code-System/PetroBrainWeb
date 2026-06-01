import { type DemoExample } from "@/lib/demoExamples";
import { Badge } from "@/components/ui/Badge";
import { CitationChip } from "@/components/ui/CitationChip";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { Banner } from "@/components/ui/Banner";

/**
 * buildExampleBlocks — renders the ordered answer blocks for a DemoExample
 * (formula → numbered steps → tail with result/sources/confidence/verification).
 * Shared by the homepage HeroDemo and the value-chain ExampleDemo so the canned-answer
 * presentation stays identical everywhere. Pure render helper (no state).
 */
export function buildExampleBlocks(example: DemoExample): React.ReactNode[] {
  const blocks: React.ReactNode[] = [];

  if (example.formula) {
    blocks.push(
      <div className="rounded-md border border-border-subtle bg-base p-3">
        <code className="block font-mono text-sm text-accent">{example.formula.expression}</code>
        {example.formula.caption && (
          <p className="mt-1.5 font-mono text-[0.7rem] leading-relaxed text-faint">
            {example.formula.caption}
          </p>
        )}
      </div>,
    );
  }

  example.steps.forEach((step, i) => {
    blocks.push(
      <div className="flex gap-2.5 text-sm text-secondary">
        <span className="mt-0.5 font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
        <span className="leading-relaxed">{step}</span>
      </div>,
    );
  });

  blocks.push(
    <div className="space-y-3">
      {example.result && (
        <p className="rounded-md border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm font-medium text-primary">
          {example.result}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {example.illustrative && <Badge tone="warn">Illustrative inputs</Badge>}
        {example.citations.map((c) => (
          <CitationChip key={c.source} source={c.source} href={c.href} />
        ))}
      </div>
      <ConfidenceLabel level={example.confidence} note={example.confidenceNote} />
      <Banner variant="warn" title="Verify with the competent person">
        {example.verification}
      </Banner>
    </div>,
  );

  return blocks;
}

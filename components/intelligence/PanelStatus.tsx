import { Badge, StageBadge } from "@/components/ui/Badge";

/**
 * PanelStatus — the per-panel data-status badge. "live"/"expanding" use the canonical
 * StageBadge (brand contract: exact strings only). "connect" is a data-connection state,
 * not a capability stage, so it's a plain Badge — never a relabelled StageBadge.
 */
export type PanelStatusKind = "live" | "connect" | "expanding";

export function PanelStatus({ kind }: { kind: PanelStatusKind }) {
  if (kind === "live") return <StageBadge stage="live" />;
  if (kind === "expanding") return <StageBadge stage="expanding" />;
  return (
    <Badge tone="neutral" dot>
      Connect your feed
    </Badge>
  );
}

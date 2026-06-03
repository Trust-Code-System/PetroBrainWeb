"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { Skeleton } from "@/components/ui/Skeleton";
import { CloseIcon } from "@/components/app/icons";
import { ASSET_TYPE_COLOR, assetTypeLabel } from "@/lib/assets/labels";
import { fmtNum } from "@/lib/emissions/labels";
import { useAsset, useDeleteAsset } from "@/lib/assets/hooks";
import type { Asset, AssetScore } from "@/lib/assets/types";

/**
 * AssetDetailPanel — right slide-over showing one asset's full detail (type, location,
 * operator, production, emission sources, climate-risk + ESG scores, documents), with
 * edit and delete. Detail is fetched from GET /assets/{id}; missing fields render honestly.
 */
export function AssetDetailPanel({
  assetId,
  onClose,
  onEdit,
  onDeleted,
}: {
  assetId: string | null;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDeleted: () => void;
}) {
  const open = assetId !== null;
  const { data: asset, isLoading, isError } = useAsset(assetId);
  const del = useDeleteAsset();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, assetId, onClose]);

  function handleDelete() {
    if (!assetId) return;
    del.mutate(assetId, {
      onSuccess: () => {
        setConfirmDelete(false);
        onDeleted();
      },
    });
  }

  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        className={cn("absolute inset-0 bg-black/50 transition-opacity duration-200", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-label="Asset detail"
        className={cn(
          "absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-border-subtle bg-surface-1 shadow-elev-3 transition-transform duration-200 sm:w-[30rem]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between gap-2 border-b border-border-subtle px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            {asset && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: ASSET_TYPE_COLOR[asset.type] }}
                aria-hidden="true"
              />
            )}
            <p className="truncate text-sm font-semibold text-primary">{asset?.name ?? "Asset"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="space-y-3" aria-busy="true">
              <span className="sr-only">Loading asset…</span>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : isError || !asset ? (
            <Banner variant="danger" title="Couldn’t load this asset">
              Please try again.
            </Banner>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{assetTypeLabel(asset.type)}</Badge>
                {asset.status && <Badge tone="info">{asset.status}</Badge>}
              </div>

              <Section label="Location">
                {asset.lat !== null && asset.lon !== null ? (
                  <p className="font-mono text-sm text-primary">
                    {asset.lat.toFixed(4)}, {asset.lon.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-sm text-faint">No coordinates — not plotted on the map.</p>
                )}
              </Section>

              <Section label="Operator">
                <p className="text-sm text-primary">{asset.operator ?? <span className="text-faint">Not set</span>}</p>
              </Section>

              <Section label="Production">
                {asset.production && asset.production.value !== null ? (
                  <p className="font-mono text-sm text-primary">
                    {fmtNum(asset.production.value)} {asset.production.unit}
                    {asset.production.asOf && <span className="ml-1 text-faint">· {asset.production.asOf}</span>}
                  </p>
                ) : (
                  <p className="text-sm text-faint">No production data yet.</p>
                )}
              </Section>

              <div className="grid grid-cols-2 gap-3">
                <ScoreCard label="Climate-risk" score={asset.climateRiskScore} />
                <ScoreCard label="ESG" score={asset.esgScore} />
              </div>

              <Section label="Emission sources">
                {asset.emissionSources && asset.emissionSources.length > 0 ? (
                  <ul className="space-y-1.5">
                    {asset.emissionSources.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-secondary">{s.label}</span>
                        <span className="font-mono text-primary">
                          {s.co2e === null ? "pending" : `${fmtNum(s.co2e)} ${s.co2eUnit}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-faint">No emission sources linked yet.</p>
                )}
              </Section>

              <Section label="Documents">
                {asset.documents && asset.documents.length > 0 ? (
                  <ul className="space-y-1.5">
                    {asset.documents.map((d) => (
                      <li key={d.id} className="text-sm">
                        {d.url ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline-offset-2 hover:underline"
                          >
                            {d.name}
                          </a>
                        ) : (
                          <span className="text-secondary">{d.name}</span>
                        )}
                        {d.kind && <span className="ml-1 text-xs text-faint">· {d.kind}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-faint">No documents attached yet.</p>
                )}
              </Section>
            </div>
          )}
        </div>

        {asset && !isLoading && !isError && (
          <footer className="flex items-center justify-between gap-2 border-t border-border-subtle px-5 py-3">
            {del.isError && <span className="text-xs text-danger">Couldn’t delete.</span>}
            <div className="ml-auto flex items-center gap-2">
              {confirmDelete ? (
                <>
                  <span className="text-xs text-secondary">Delete this asset?</span>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={del.isPending}
                    className="rounded-md border border-danger/50 bg-danger/10 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/20 disabled:opacity-50"
                  >
                    {del.isPending ? "Deleting…" : "Delete"}
                  </button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="secondary" onClick={() => onEdit(asset)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                    Delete
                  </Button>
                </>
              )}
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-1 font-mono text-xs uppercase tracking-wider text-faint">{label}</p>
      {children}
    </section>
  );
}

function ScoreCard({ label, score }: { label: string; score?: AssetScore }) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
      <p className="text-xs text-faint">{label}</p>
      {score && score.score !== null ? (
        <p className="mt-0.5 font-mono text-xl font-semibold tabular-nums text-primary">
          {score.score}
          {score.band && <span className="ml-1 text-xs font-normal text-secondary">{score.band}</span>}
        </p>
      ) : (
        <p className="mt-0.5 text-sm text-faint">Not scored yet</p>
      )}
    </div>
  );
}

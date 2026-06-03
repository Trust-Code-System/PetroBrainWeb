import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StageBadge } from "@/components/ui/Badge";
import { OpportunitiesWorkspace } from "@/components/opportunities/OpportunitiesWorkspace";

export const metadata: Metadata = {
  title: "Opportunities",
};

/**
 * /app/opportunities — discover and track West-African oil & gas licensing rounds (and
 * marginal-field rounds). v1 is discover & track only: list, filter, deadlines, watch, notes,
 * alerts. All round data is backend-sourced (curated + AI-assisted public-source ingestion);
 * the frontend never scrapes or fabricates. "Live · public sources" is honest — the page only
 * shows rounds the backend can verify from a public source.
 */
export default function OpportunitiesPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Opportunities — Licensing Rounds"
        description="Active and upcoming licensing rounds across West Africa, tracked for your team."
        actions={<StageBadge stage="live" note="public sources" />}
      />
      {/* useSearchParams (tab deep-link) requires a Suspense boundary in the app router. */}
      <Suspense fallback={null}>
        <OpportunitiesWorkspace />
      </Suspense>
    </div>
  );
}

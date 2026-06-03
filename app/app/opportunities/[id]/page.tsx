import type { Metadata } from "next";
import { RoundDetailRoute } from "@/components/opportunities/RoundDetailRoute";

export const metadata: Metadata = {
  title: "Round detail",
};

/**
 * /app/opportunities/[id] — full-page view of one licensing round (the same RoundDetail the
 * list shows in a slide-over). Deep-linkable from notifications/emails. Data is fetched
 * client-side via the /api/pb proxy; honest loading/error states.
 */
export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-7xl">
      <RoundDetailRoute id={decodeURIComponent(id)} />
    </div>
  );
}

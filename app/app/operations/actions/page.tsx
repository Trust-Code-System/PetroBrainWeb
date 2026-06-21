import type { Metadata } from "next";
import { ActionTrackerWorkspace } from "@/components/operations/ActionTrackerWorkspace";

export const metadata: Metadata = { title: "Action Tracker" };

export default function ActionTrackerPage() {
  return <ActionTrackerWorkspace />;
}

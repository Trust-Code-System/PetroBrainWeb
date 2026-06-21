import type { Metadata } from "next";
import { OpsLogWorkspace } from "@/components/operations/OpsLogWorkspace";

export const metadata: Metadata = { title: "Operations Log" };

export default function OperationsLogPage() {
  return <OpsLogWorkspace />;
}

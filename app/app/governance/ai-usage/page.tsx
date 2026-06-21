import type { Metadata } from "next";
import { AiGovernanceWorkspace } from "@/components/governance/AiGovernanceWorkspace";

export const metadata: Metadata = { title: "AI Governance" };

export default function AiGovernancePage() {
  return <AiGovernanceWorkspace />;
}

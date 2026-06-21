import type { Metadata } from "next";
import { ComplianceGuardianWorkspace } from "@/components/compliance/ComplianceGuardianWorkspace";

export const metadata: Metadata = { title: "Compliance Guardian" };

export default function ComplianceGuardianPage() {
  return <ComplianceGuardianWorkspace />;
}

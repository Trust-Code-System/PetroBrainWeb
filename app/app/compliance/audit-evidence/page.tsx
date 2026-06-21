import type { Metadata } from "next";
import { AuditEvidenceWorkspace } from "@/components/compliance/AuditEvidenceWorkspace";

export const metadata: Metadata = { title: "Audit Evidence" };

export default function AuditEvidencePage() {
  return <AuditEvidenceWorkspace />;
}

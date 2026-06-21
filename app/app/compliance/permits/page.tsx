import type { Metadata } from "next";
import { PermitsWorkspace } from "@/components/compliance/PermitsWorkspace";

export const metadata: Metadata = { title: "Permits & Certificates" };

export default function PermitsCertificatesPage() {
  return <PermitsWorkspace />;
}

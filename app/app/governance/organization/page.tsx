import type { Metadata } from "next";
import { OrganizationWorkspace } from "@/components/governance/OrganizationWorkspace";

export const metadata: Metadata = { title: "Organization" };

export default function OrganizationPage() {
  return <OrganizationWorkspace />;
}

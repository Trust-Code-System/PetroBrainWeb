import type { Metadata } from "next";
import { HseWorkspace } from "@/components/operations/HseWorkspace";

export const metadata: Metadata = { title: "HSE Center" };

export default function HseCenterPage() {
  return <HseWorkspace />;
}

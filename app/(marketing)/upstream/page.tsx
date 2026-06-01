import type { Metadata } from "next";
import { ValueChainPage } from "@/components/value-chain/ValueChainPage";
import { valueChains, valueChainMetadata } from "@/lib/valueChain";

export const metadata: Metadata = valueChainMetadata("upstream");

export default function UpstreamPage() {
  return <ValueChainPage config={valueChains.upstream} />;
}

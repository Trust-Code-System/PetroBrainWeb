import type { Metadata } from "next";
import { ValueChainPage } from "@/components/value-chain/ValueChainPage";
import { valueChains, valueChainMetadata } from "@/lib/valueChain";

export const metadata: Metadata = valueChainMetadata("midstream");

export default function MidstreamPage() {
  return <ValueChainPage config={valueChains.midstream} />;
}

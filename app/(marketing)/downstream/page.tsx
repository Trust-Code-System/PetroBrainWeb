import type { Metadata } from "next";
import { ValueChainPage } from "@/components/value-chain/ValueChainPage";
import { valueChains, valueChainMetadata } from "@/lib/valueChain";

export const metadata: Metadata = valueChainMetadata("downstream");

export default function DownstreamPage() {
  return <ValueChainPage config={valueChains.downstream} />;
}

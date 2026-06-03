import { describe, it, expect } from "vitest";
import { deriveTileState, type QueryLike, type TileState } from "../marketState";
import type { OilPrices } from "@/lib/public-data/types";

const value = (): TileState => ({ status: "value", value: "$82.10", unit: "/bbl", meta: "as of 2026-05-30" });
const pick = () => value();

function q(partial: Partial<QueryLike<OilPrices>>): QueryLike<OilPrices> {
  return { isLoading: false, isError: false, data: undefined, ...partial };
}

describe("deriveTileState", () => {
  it("loading → loading", () => {
    expect(deriveTileState(q({ isLoading: true }), pick)).toEqual({ status: "loading" });
  });

  it("error or no data → unavailable (not a fabricated value)", () => {
    expect(deriveTileState(q({ isError: true }), pick).status).toBe("unavailable");
    expect(deriveTileState(q({}), pick).status).toBe("unavailable");
  });

  it("envelope unavailable → passes through the honest reason", () => {
    const r = deriveTileState(
      q({ data: { status: "unavailable", source: { name: "EIA", url: "", description: "" }, reason: "No key", checkedAt: "" } }),
      pick,
    );
    expect(r).toEqual({ status: "unavailable", reason: "No key" });
  });

  it("ok → the picked value", () => {
    const r = deriveTileState(
      q({ data: { status: "ok", data: { prices: [] }, source: { name: "EIA", url: "", description: "" }, fetchedAt: "", stale: false } }),
      pick,
    );
    expect(r).toMatchObject({ status: "value", value: "$82.10" });
    expect((r as { stale?: boolean }).stale).toBeFalsy();
  });

  it("ok + stale → flags the value as stale (real data, just old)", () => {
    const r = deriveTileState(
      q({ data: { status: "ok", data: { prices: [] }, source: { name: "EIA", url: "", description: "" }, fetchedAt: "", stale: true } }),
      pick,
    );
    expect(r).toMatchObject({ status: "value", stale: true });
  });
});

import { describe, it, expect, vi } from "vitest";
import { serveProvider } from "../provider";
import { InMemoryCache } from "../cache";
import { ProviderUnavailableError, type DataProvider } from "../types";

const source = { name: "Test Source", url: "https://example.test", description: "test data" };

function makeProvider(
  load: DataProvider<{ n: number }>["load"],
  ttlSeconds = 60,
): DataProvider<{ n: number }> {
  return { key: "test", source, ttlSeconds, load };
}

describe("serveProvider — success", () => {
  it("returns an ok envelope with real data + provenance", async () => {
    const cache = new InMemoryCache(() => 1_000);
    const env = await serveProvider(makeProvider(async () => ({ n: 1 })), { cache });

    expect(env.status).toBe("ok");
    if (env.status !== "ok") throw new Error("expected ok");
    expect(env.data).toEqual({ n: 1 });
    expect(env.stale).toBe(false);
    expect(env.source).toEqual(source);
    expect(typeof env.fetchedAt).toBe("string");
  });

  it("serves a fresh cache hit without calling the source again", async () => {
    const cache = new InMemoryCache();
    cache.set("test", { n: 5 }, 60);
    const load = vi.fn();

    const env = await serveProvider(makeProvider(load), { cache });

    expect(load).not.toHaveBeenCalled();
    expect(env.status === "ok" && env.data).toEqual({ n: 5 });
  });
});

describe("serveProvider — honest fallback (NEVER fabricates)", () => {
  it("returns 'unavailable' with the provider's reason and NO data field", async () => {
    const cache = new InMemoryCache();
    const env = await serveProvider(
      makeProvider(async () => {
        throw new ProviderUnavailableError("Source not connected yet.");
      }),
      { cache },
    );

    expect(env.status).toBe("unavailable");
    if (env.status !== "unavailable") throw new Error("expected unavailable");
    expect(env.reason).toBe("Source not connected yet.");
    expect(typeof env.checkedAt).toBe("string");
    // The crucial guarantee: no fabricated numbers leak through.
    expect("data" in env).toBe(false);
  });

  it("does not leak internal error messages — uses a generic reason", async () => {
    const cache = new InMemoryCache();
    const env = await serveProvider(
      makeProvider(async () => {
        throw new Error("ECONNREFUSED 10.0.0.1:5432 internal stack detail");
      }),
      { cache },
    );

    expect(env.status).toBe("unavailable");
    if (env.status !== "unavailable") throw new Error("expected unavailable");
    expect(env.reason).not.toContain("ECONNREFUSED");
    expect(env.reason).not.toContain("10.0.0.1");
  });

  it("serves last-good REAL data (flagged stale) when the source goes down", async () => {
    let now = 0;
    const cache = new InMemoryCache(() => now);
    const load = vi
      .fn<DataProvider<{ n: number }>["load"]>()
      .mockResolvedValueOnce({ n: 7 })
      .mockRejectedValueOnce(new ProviderUnavailableError("down"));
    const provider = makeProvider(load, 60);

    const first = await serveProvider(provider, { cache });
    expect(first.status === "ok" && first.stale).toBe(false);

    now = 120_000; // past the 60s TTL → cache expired
    const second = await serveProvider(provider, { cache });

    expect(second.status).toBe("ok");
    if (second.status !== "ok") throw new Error("expected ok");
    expect(second.data).toEqual({ n: 7 }); // the real, previously-fetched value
    expect(second.stale).toBe(true); // flagged honestly as out-of-date
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("times out a hanging source into an 'unavailable' state", async () => {
    const cache = new InMemoryCache();
    const provider = makeProvider(
      (signal) =>
        new Promise<{ n: number }>((_, reject) => {
          signal.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );

    const env = await serveProvider(provider, { cache, timeoutMs: 10 });
    expect(env.status).toBe("unavailable");
  });
});

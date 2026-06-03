import { describe, it, expect } from "vitest";
import { InMemoryCache } from "../cache";

describe("InMemoryCache", () => {
  it("stores and returns a value with timestamps", () => {
    let now = 1_000;
    const cache = new InMemoryCache(() => now);
    cache.set("k", { n: 42 }, 60);

    const entry = cache.get<{ n: number }>("k");
    expect(entry?.value).toEqual({ n: 42 });
    expect(entry?.storedAt).toBe(1_000);
    expect(entry?.expiresAt).toBe(1_000 + 60_000);
  });

  it("reports expiry against the injected clock", () => {
    let now = 0;
    const cache = new InMemoryCache(() => now);
    cache.set("k", "v", 10);
    const entry = cache.get("k")!;

    expect(cache.isExpired(entry)).toBe(false);
    now = 10_000; // exactly at expiry → expired
    expect(cache.isExpired(entry)).toBe(true);
  });

  it("returns an expired entry from get (callers decide what to do with it)", () => {
    let now = 0;
    const cache = new InMemoryCache(() => now);
    cache.set("k", "v", 1);
    now = 5_000;
    expect(cache.get("k")?.value).toBe("v"); // still present, just expired
  });

  it("deletes and clears", () => {
    const cache = new InMemoryCache();
    cache.set("a", 1, 60);
    cache.set("b", 2, 60);
    cache.delete("a");
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")?.value).toBe(2);
    cache.clear();
    expect(cache.get("b")).toBeUndefined();
  });
});

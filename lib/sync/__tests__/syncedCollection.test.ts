// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSyncedCollection, type SyncAdapter } from "@/lib/sync/syncedCollection";

/**
 * The dual-mode synced collection: optimistic local writes that write through to a backend
 * adapter, with a non-destructive hydrate and an honest local fallback on every failure.
 */

type Rec = { id: string; serverId?: string; pendingSync?: boolean; title: string };

/** Let queued microtasks/promises settle. */
const flush = () => new Promise((r) => setTimeout(r, 0));

function mockAdapter(over: Partial<SyncAdapter<Rec>> = {}): SyncAdapter<Rec> {
  return {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ serverId: "srv" }),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    ...over,
  };
}

let n = 0;
const freshKey = () => `synced-test-${n++}`;

beforeEach(() => localStorage.clear());

describe("without an adapter (pure local-first)", () => {
  it("adds, updates and removes locally with no network calls", () => {
    const c = createSyncedCollection<Rec>(freshKey(), null);
    c.add({ id: "a", title: "x" });
    expect(c.getAll()).toHaveLength(1);
    c.update("a", { title: "y" });
    expect(c.getAll()[0]?.title).toBe("y");
    c.remove("a");
    expect(c.getAll()).toHaveLength(0);
  });
});

describe("create write-through", () => {
  it("applies locally immediately, then merges the server id", async () => {
    const adapter = mockAdapter({ create: vi.fn().mockResolvedValue({ serverId: "srv9" }) });
    const c = createSyncedCollection<Rec>(freshKey(), adapter);

    c.add({ id: "loc", title: "t" });
    expect(c.getAll()[0]?.serverId).toBeUndefined(); // optimistic, before the POST resolves

    await flush();
    expect(adapter.create).toHaveBeenCalledOnce();
    expect(c.getAll()[0]?.serverId).toBe("srv9");
    expect(c.getAll()[0]?.pendingSync).toBe(false);
  });

  it("flags pendingSync (keeps the record) when the backend rejects", async () => {
    const adapter = mockAdapter({ create: vi.fn().mockRejectedValue(new Error("401")) });
    const c = createSyncedCollection<Rec>(freshKey(), adapter);

    c.add({ id: "loc", title: "t" });
    await flush();

    expect(c.getAll()).toHaveLength(1);
    expect(c.getAll()[0]?.pendingSync).toBe(true);
    expect(c.getAll()[0]?.serverId).toBeUndefined();
  });
});

describe("hydrate (non-destructive merge)", () => {
  it("adds server records while preserving local-only ones, and keeps local cache on failure", async () => {
    const key = freshKey();
    localStorage.setItem(key, JSON.stringify([{ id: "local1", title: "local only" }]));

    const ok = mockAdapter({
      list: vi.fn().mockResolvedValue([{ id: "s1", serverId: "s1", title: "from server" }]),
    });
    const c = createSyncedCollection<Rec>(key, ok);
    c.hydrate();
    await flush();

    const ids = c.getAll().map((r) => r.id).sort();
    expect(ids).toEqual(["local1", "s1"]);
  });

  it("keeps the local cache intact when the list call fails", async () => {
    const key = freshKey();
    localStorage.setItem(key, JSON.stringify([{ id: "local1", title: "keep me" }]));

    const down = mockAdapter({ list: vi.fn().mockRejectedValue(new Error("offline")) });
    const c = createSyncedCollection<Rec>(key, down);
    c.hydrate();
    await flush();

    expect(c.getAll()).toEqual([{ id: "local1", title: "keep me" }]);
  });

  it("refreshes a synced record from the server but preserves a pending local edit", async () => {
    const key = freshKey();
    localStorage.setItem(
      key,
      JSON.stringify([
        { id: "s1", serverId: "s1", title: "stale", pendingSync: false },
        { id: "s2", serverId: "s2", title: "my unsaved edit", pendingSync: true },
      ]),
    );
    const adapter = mockAdapter({
      list: vi.fn().mockResolvedValue([
        { id: "s1", serverId: "s1", title: "server truth", pendingSync: false },
        { id: "s2", serverId: "s2", title: "server old", pendingSync: false },
      ]),
    });
    const c = createSyncedCollection<Rec>(key, adapter);
    c.hydrate();
    await flush();

    const byId = Object.fromEntries(c.getAll().map((r) => [r.id, r.title]));
    expect(byId.s1).toBe("server truth"); // server wins for clean records
    expect(byId.s2).toBe("my unsaved edit"); // pending local edit preserved
  });
});

describe("update / remove write-through", () => {
  it("PATCHes a synced record and DELETEs it on the backend", async () => {
    const adapter = mockAdapter({ create: vi.fn().mockResolvedValue({ serverId: "srv" }) });
    const c = createSyncedCollection<Rec>(freshKey(), adapter);

    c.add({ id: "loc", title: "t" });
    await flush(); // gets serverId "srv"

    c.update("loc", { title: "edited" });
    await flush();
    expect(adapter.update).toHaveBeenCalledWith("srv", expect.objectContaining({ title: "edited" }));

    c.remove("loc");
    await flush();
    expect(adapter.remove).toHaveBeenCalledWith("srv");
    expect(c.getAll()).toHaveLength(0);
  });
});

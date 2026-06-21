"use client";

import { useSyncExternalStore } from "react";

/**
 * createSyncedCollection — a reactive, localStorage-backed collection (the same synchronous,
 * useSyncExternalStore-driven API as lib/localStore.ts) that ALSO syncs with a backend through
 * a pluggable adapter. This is the dual-mode bridge for migrating the local-first modules to the
 * `/api/pb` proxy WITHOUT changing the component API: `useAll()` still returns `T[]` synchronously,
 * `add/update/remove` still return `void` immediately, so every consumer page is untouched.
 *
 * Behaviour (optimistic, fallback-safe — never loses local data):
 *  - **Hydrate** once on first mount: `adapter.list()` is merged into the local cache
 *    NON-DESTRUCTIVELY — server records are added/refreshed, but local-only records and any
 *    local record with unflushed edits (`pendingSync`) are preserved. If the call fails (offline,
 *    401, cold-started backend, endpoint not built yet) the local cache is kept as-is → the module
 *    behaves exactly as the old local-first version. This is the honest fallback the platform requires.
 *  - **Writes** apply to the local cache immediately (so the UI and `createX().id`-based undo keep
 *    working), then write through to the backend in the background. On success the server id is
 *    merged back; on failure the record is flagged `pendingSync` and stays local.
 *
 * Pass `adapter: null` to get a pure local-first collection (identical to createLocalCollection) —
 * used by modules whose backend endpoint doesn't exist yet.
 */

export type SyncRecord = { id: string; serverId?: string; pendingSync?: boolean };

export type SyncAdapter<T extends SyncRecord> = {
  /** GET the collection, already mapped to local shape with `serverId` populated. */
  list: (signal?: AbortSignal) => Promise<T[]>;
  /** POST a new record; resolves with the server fields to merge (at least `serverId`). */
  create: (record: T) => Promise<Partial<T> & { serverId: string }>;
  /** PATCH an already-synced record (has a `serverId`). */
  update: (serverId: string, record: T) => Promise<void>;
  /** DELETE a synced record. */
  remove: (serverId: string) => Promise<void>;
};

export type SyncedCollection<T extends SyncRecord> = {
  useAll: () => T[];
  getAll: () => T[];
  add: (record: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  replaceAll: (records: T[]) => void;
  /** Re-pull from the backend (no-op without an adapter). Safe to call repeatedly. */
  hydrate: () => void;
};

const EMPTY: readonly never[] = Object.freeze([]);

export function createSyncedCollection<T extends SyncRecord>(
  key: string,
  adapter: SyncAdapter<T> | null,
): SyncedCollection<T> {
  const listeners = new Set<() => void>();
  let cache: T[] | null = null;
  let hydrated = false;
  let hydrating = false;

  function read(): T[] {
    if (cache) return cache;
    if (typeof window === "undefined") {
      cache = [];
      return cache;
    }
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      cache = Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function commit(next: T[]) {
    cache = next;
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — collection is session-only */
    }
    listeners.forEach((l) => l());
  }

  /** Immutable patch of a single record by its (stable, local) id. No-op if it's gone. */
  function patchById(id: string, patch: Partial<T>) {
    const cur = read();
    if (!cur.some((r) => r.id === id)) return;
    commit(cur.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function hydrate() {
    if (!adapter || hydrating || typeof window === "undefined") return;
    hydrating = true;
    adapter
      .list()
      .then((server) => {
        const local = read();
        const localBySid = new Map(
          local.filter((r) => r.serverId).map((r) => [r.serverId as string, r]),
        );
        const next: T[] = [];
        // 1. Local-only records (never synced) stay — most-recent-first, as added.
        for (const r of local) if (!r.serverId) next.push(r);
        // 2. Server records become the source of truth, EXCEPT where we hold a pending local edit.
        for (const s of server) {
          const existing = s.serverId ? localBySid.get(s.serverId) : undefined;
          next.push(existing?.pendingSync ? existing : s);
          if (s.serverId) localBySid.delete(s.serverId);
        }
        // 3. Previously-synced records the server didn't return: keep only if pending (unflushed).
        for (const leftover of localBySid.values()) if (leftover.pendingSync) next.push(leftover);
        commit(next);
        hydrated = true;
      })
      .catch(() => {
        /* Backend unavailable → keep local cache (honest fallback). Allow a later retry. */
      })
      .finally(() => {
        hydrating = false;
      });
  }

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    if (adapter && !hydrated) hydrate();
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        cb();
      }
    };
    if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
    };
  }

  function add(record: T) {
    commit([record, ...read()]);
    if (!adapter) return;
    adapter
      .create(record)
      .then((srv) => patchById(record.id, { ...srv, pendingSync: false }))
      .catch(() => patchById(record.id, { pendingSync: true } as Partial<T>));
  }

  function update(id: string, patch: Partial<T>) {
    patchById(id, patch);
    if (!adapter) return;
    const rec = read().find((r) => r.id === id);
    if (!rec) return;
    if (!rec.serverId) {
      // Created while the backend was unavailable — leave it flagged for a future flush.
      patchById(id, { pendingSync: true } as Partial<T>);
      return;
    }
    adapter
      .update(rec.serverId, rec)
      .then(() => patchById(id, { pendingSync: false } as Partial<T>))
      .catch(() => patchById(id, { pendingSync: true } as Partial<T>));
  }

  function remove(id: string) {
    const rec = read().find((r) => r.id === id);
    commit(read().filter((r) => r.id !== id));
    if (!adapter || !rec?.serverId) return;
    adapter.remove(rec.serverId).catch(() => {
      /* Backend delete failed — the record may reappear on next hydrate, which is honest. */
    });
  }

  return {
    useAll: () => useSyncExternalStore(subscribe, read, () => EMPTY as unknown as T[]),
    getAll: read,
    add,
    update,
    remove,
    replaceAll: (records: T[]) => commit(records),
    hydrate,
  };
}

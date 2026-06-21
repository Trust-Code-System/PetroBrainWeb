"use client";

import { useSyncExternalStore } from "react";

/**
 * createLocalCollection — a tiny reactive, localStorage-backed collection of records.
 *
 * WHY: several rebuild modules (Action Tracker, HSE Center, …) need genuinely working
 * create/read/update/delete BEFORE their backend endpoints exist. Rather than fake a server
 * (which the platform's honesty rules forbid) we persist to the device with localStorage —
 * the same approach the copilot conversation history and calc recents already use. Data is
 * clearly labelled "on this device" in the UI; swapping in `/api/pb` later means replacing
 * these helpers with React Query calls and keeping the same component API.
 *
 * Reactive across components in the tab (and across tabs via the `storage` event) through
 * useSyncExternalStore — so e.g. the Command Center's counts update the instant an action
 * is created on the Action Tracker page.
 */

export type Identifiable = { id: string };

const EMPTY: readonly never[] = Object.freeze([]);

export type LocalCollection<T extends Identifiable> = {
  useAll: () => T[];
  getAll: () => T[];
  add: (record: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  /** Replace the whole collection (e.g. bulk import). */
  replaceAll: (records: T[]) => void;
};

export function createLocalCollection<T extends Identifiable>(key: string): LocalCollection<T> {
  const listeners = new Set<() => void>();
  // In-memory snapshot so useSyncExternalStore gets a STABLE reference between writes
  // (returning a fresh array each read would loop forever).
  let cache: T[] | null = null;

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

  function subscribe(cb: () => void): () => void {
    listeners.add(cb);
    // Cross-tab: another tab wrote the same key → drop cache and notify.
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

  return {
    useAll: () =>
      useSyncExternalStore(
        subscribe,
        read,
        () => EMPTY as unknown as T[],
      ),
    getAll: read,
    add: (record) => commit([record, ...read()]),
    update: (id, patch) =>
      commit(read().map((r) => (r.id === id ? { ...r, ...patch } : r))),
    remove: (id) => commit(read().filter((r) => r.id !== id)),
    replaceAll: (records) => commit(records),
  };
}

/** Short, sortable, collision-resistant id for client-created records. */
export function localId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

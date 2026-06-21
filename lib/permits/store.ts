"use client";

import { createLocalCollection, localId } from "@/lib/localStore";
import { createAction, todayISO } from "@/lib/actions/store";
import { PERMIT_TYPE_LABEL } from "./labels";
import type { CreatePermitInput, Permit, PermitCounts, PermitStatus } from "./types";

/**
 * Permits & Certificates store — device-local (localStorage) until the backend lands.
 * `permitStatus` derives valid / expiring-soon / expired from the expiry date + reminder
 * window, so the Command Center and Compliance Guardian can count expiring documents honestly.
 */

const collection = createLocalCollection<Permit>("pb-permits");

export const usePermits = collection.useAll;
export const getPermits = collection.getAll;

const DAY = 24 * 60 * 60 * 1000;

export function createPermit(input: CreatePermitInput): Permit {
  const now = Date.now();
  const permit: Permit = {
    ...input,
    id: localId("prm"),
    actionIds: [],
    createdAt: now,
    updatedAt: now,
  };
  collection.add(permit);
  return permit;
}

export function updatePermit(id: string, patch: Partial<Permit>): void {
  collection.update(id, { ...patch, updatedAt: Date.now() });
}

export function deletePermit(id: string): void {
  collection.remove(id);
}

/** Derive a permit's lifecycle status from its expiry date and reminder window. */
export function permitStatus(p: Permit, today: string = todayISO()): PermitStatus {
  if (!p.expiryDate) return "no_date";
  if (p.expiryDate < today) return "expired";
  const expiry = new Date(`${p.expiryDate}T00:00:00`).getTime();
  const now = new Date(`${today}T00:00:00`).getTime();
  const windowMs = Math.max(0, p.reminderDays) * DAY;
  return expiry - now <= windowMs ? "expiring_soon" : "valid";
}

/** Whole-number days until expiry (negative if past). Null when no expiry date. */
export function daysUntilExpiry(p: Permit, today: string = todayISO()): number | null {
  if (!p.expiryDate) return null;
  const expiry = new Date(`${p.expiryDate}T00:00:00`).getTime();
  const now = new Date(`${today}T00:00:00`).getTime();
  return Math.round((expiry - now) / DAY);
}

export function permitCounts(permits: Permit[], today: string = todayISO()): PermitCounts {
  return permits.reduce<PermitCounts>(
    (acc, p) => {
      acc.total += 1;
      const s = permitStatus(p, today);
      if (s === "valid") acc.valid += 1;
      if (s === "expiring_soon") acc.expiringSoon += 1;
      if (s === "expired") acc.expired += 1;
      return acc;
    },
    { total: 0, valid: 0, expiringSoon: 0, expired: 0 },
  );
}

/** Raise a renewal action in the Action Tracker for a permit and link it back. */
export function raiseRenewalAction(permit: Permit): void {
  const action = createAction({
    title: `Renew: ${permit.name}`,
    description: `${PERMIT_TYPE_LABEL[permit.type]}${
      permit.issuingAuthority ? ` · ${permit.issuingAuthority}` : ""
    }${permit.expiryDate ? ` · expires ${permit.expiryDate}` : ""}.`,
    sourceModule: "compliance",
    sourceRef: permit.name,
    owner: permit.owner,
    dueDate: permit.expiryDate,
    priority: permitStatus(permit) === "expired" ? "critical" : "high",
    status: "open",
  });
  collection.update(permit.id, {
    actionIds: [...permit.actionIds, action.id],
    updatedAt: Date.now(),
  });
}

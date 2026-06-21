"use client";

import { useDepartmentNames } from "@/lib/org/store";

/**
 * DepartmentDatalist — a shared <datalist id="pb-departments"> populated from the Organization
 * department register. Cross-module forms (Action Tracker, Operations Log, HSE Center) point
 * their free-text department <Input list="pb-departments"> at it, so the same vocabulary is
 * suggested everywhere without forcing a hard dependency (typing a new department still works).
 */
export const DEPARTMENT_DATALIST_ID = "pb-departments";

export function DepartmentDatalist() {
  const names = useDepartmentNames();
  if (names.length === 0) return null;
  return (
    <datalist id={DEPARTMENT_DATALIST_ID}>
      {names.map((name) => (
        <option key={name} value={name} />
      ))}
    </datalist>
  );
}

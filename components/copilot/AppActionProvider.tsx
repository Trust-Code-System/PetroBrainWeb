"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/providers/ToastProvider";
import { emissionsApi } from "@/lib/emissions/client";
import type { CreateEmissionInput } from "@/lib/emissions/types";
import {
  type AppAction,
  type AppActionKind,
  type AuditEntry,
  type CreateRecordAction,
} from "@/lib/copilot/actions";

/**
 * AppActionProvider — executes the copilot's app actions on the frontend. Writes
 * (create_record) run only via `confirm` (the UI shows a confirmation card first); on
 * success they toast with UNDO and append to the audit trail. Navigate / apply_filter /
 * generate_report run via `run` (one-tap, reversible). Pages register handlers for
 * apply_filter / generate_report with `useActionHandler`.
 *
 * The copilot NEVER actuates anything operational — only these app-level actions.
 */

type ActionStatus = "proposed" | "executing" | "done" | "cancelled" | "error";

interface AppActionContextValue {
  statusOf: (id: string) => ActionStatus;
  errorOf: (id: string) => string | null;
  confirm: (action: CreateRecordAction) => void;
  cancel: (action: AppAction) => void;
  run: (action: AppAction) => void;
  audit: AuditEntry[];
  registerHandler: (kind: AppActionKind, fn: (action: AppAction) => void) => () => void;
}

const AppActionContext = createContext<AppActionContextValue | null>(null);

let auditSeq = 0;

export function AppActionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const qc = useQueryClient();
  const { show } = useToast();

  const [states, setStates] = useState<Record<string, { status: ActionStatus; error?: string }>>({});
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const handlers = useRef<Map<AppActionKind, (action: AppAction) => void>>(new Map());

  const setStatus = useCallback((id: string, status: ActionStatus, error?: string) => {
    setStates((prev) => ({ ...prev, [id]: { status, error } }));
  }, []);

  const statusOf = useCallback((id: string) => states[id]?.status ?? "proposed", [states]);
  const errorOf = useCallback((id: string) => states[id]?.error ?? null, [states]);

  const invalidateEmissions = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ["emissions"] });
  }, [qc]);

  // Best-effort backend audit log (assumed POST /audit); never blocks the UI.
  const postAudit = useCallback((entry: AuditEntry) => {
    void fetch("/api/pb/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});
  }, []);

  const undoCreate = useCallback(
    (entryId: string, recordId: string) => {
      void (async () => {
        try {
          await emissionsApi.deleteSource(recordId);
          invalidateEmissions();
          setAudit((prev) =>
            prev.map((e) => (e.id === entryId ? { ...e, status: "undone" as const } : e)),
          );
          show({ message: `Undone — ${recordId} removed`, tone: "default" });
        } catch {
          show({ message: `Couldn’t undo ${recordId}. Please try again.`, tone: "danger" });
        }
      })();
    },
    [invalidateEmissions, show],
  );

  const confirm = useCallback(
    (action: CreateRecordAction) => {
      setStatus(action.id, "executing");
      void (async () => {
        try {
          const created = await emissionsApi.createSource(action.record as unknown as CreateEmissionInput);
          invalidateEmissions();
          setStatus(action.id, "done");

          const entry: AuditEntry = {
            id: `a${Date.now()}_${auditSeq++}`,
            at: new Date().toISOString(),
            kind: "create_record",
            summary: `Created emission record ${created.id}`,
            recordType: action.recordType,
            recordId: created.id,
            undoable: true,
            status: "committed",
          };
          setAudit((prev) => [entry, ...prev]);
          postAudit(entry);
          show({
            message: `Copilot created ${created.id}`,
            tone: "success",
            undo: () => undoCreate(entry.id, created.id),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Write failed.";
          setStatus(action.id, "error", message);
          show({ message: `Couldn’t create the record: ${message}`, tone: "danger" });
        }
      })();
    },
    [setStatus, invalidateEmissions, postAudit, show, undoCreate],
  );

  const cancel = useCallback(
    (action: AppAction) => setStatus(action.id, "cancelled"),
    [setStatus],
  );

  const run = useCallback(
    (action: AppAction) => {
      switch (action.kind) {
        case "navigate":
          router.push(action.to);
          show({ message: action.label ? `Opened ${action.label}` : "Navigated" });
          setStatus(action.id, "done");
          break;
        case "apply_filter": {
          const handler = handlers.current.get("apply_filter");
          if (handler) {
            handler(action);
            show({ message: "Filters applied" });
            setStatus(action.id, "done");
          } else {
            show({ message: "Open the relevant page to apply these filters.", tone: "default" });
            setStatus(action.id, "cancelled");
          }
          break;
        }
        case "generate_report": {
          const handler = handlers.current.get("generate_report");
          if (handler) {
            handler(action);
            setStatus(action.id, "done");
          } else {
            router.push("/app/emissions");
            show({ message: "Open the Emissions page to generate the report." });
            setStatus(action.id, "done");
          }
          break;
        }
        case "create_record":
          // Writes must go through confirm(); ignore a direct run.
          break;
      }
    },
    [router, show, setStatus],
  );

  const registerHandler = useCallback((kind: AppActionKind, fn: (action: AppAction) => void) => {
    handlers.current.set(kind, fn);
    return () => {
      if (handlers.current.get(kind) === fn) handlers.current.delete(kind);
    };
  }, []);

  const value = useMemo<AppActionContextValue>(
    () => ({ statusOf, errorOf, confirm, cancel, run, audit, registerHandler }),
    [statusOf, errorOf, confirm, cancel, run, audit, registerHandler],
  );

  return <AppActionContext.Provider value={value}>{children}</AppActionContext.Provider>;
}

export function useAppActions(): AppActionContextValue {
  const ctx = useContext(AppActionContext);
  if (!ctx) throw new Error("useAppActions must be used within <AppActionProvider>");
  return ctx;
}

/** Register a page-scoped handler for apply_filter / generate_report; latest fn always runs. */
export function useActionHandler(kind: AppActionKind, fn: (action: AppAction) => void): void {
  const { registerHandler } = useAppActions();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => registerHandler(kind, (a) => ref.current(a)), [kind, registerHandler]);
}

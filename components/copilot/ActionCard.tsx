"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { useAppActions } from "./AppActionProvider";
import { actionLabel, isWriteAction, type AppAction, type CreateRecordAction } from "@/lib/copilot/actions";

/**
 * ActionCard — renders a copilot-proposed app action inside the chat. Writes
 * (create_record) get a blocking confirmation card with Confirm / Edit / Cancel — nothing
 * is written until the user confirms. Reversible actions (navigate / filter / report)
 * render as a one-tap chip.
 */
export function ActionCard({ action }: { action: AppAction }) {
  const { statusOf, errorOf, confirm, cancel, run } = useAppActions();
  const status = statusOf(action.id);

  if (!isWriteAction(action)) {
    const done = status === "done";
    return (
      <button
        type="button"
        onClick={() => run(action)}
        disabled={done}
        className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-surface-2 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-surface-3 disabled:opacity-60"
      >
        {done ? "✓ " : "▸ "}
        {actionLabel(action)}
      </button>
    );
  }

  return <WriteCard action={action} status={status} error={errorOf(action.id)} confirm={confirm} cancel={cancel} />;
}

function WriteCard({
  action,
  status,
  error,
  confirm,
  cancel,
}: {
  action: CreateRecordAction;
  status: string;
  error: string | null;
  confirm: (action: CreateRecordAction) => void;
  cancel: (action: AppAction) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [record, setRecord] = useState<Record<string, unknown>>(action.record);

  if (status === "done") {
    return (
      <div className="rounded-lg border border-safe/40 bg-safe/10 px-3 py-2 text-sm text-primary">
        ✓ Record created. Use the toast to undo.
      </div>
    );
  }
  if (status === "cancelled") {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-sm text-faint">
        Cancelled — nothing was written.
      </div>
    );
  }

  const executing = status === "executing";

  return (
    <div className="space-y-2 rounded-lg border border-accent/40 bg-surface-2 p-3">
      <p className="text-sm font-medium text-primary">{action.title}</p>
      {action.summary && <p className="text-xs text-secondary">{action.summary}</p>}

      {editing ? (
        <div className="space-y-2">
          {Object.entries(record).map(([key, value]) => (
            <label key={key} className="block">
              <span className="mb-0.5 block font-mono text-[0.7rem] uppercase tracking-wider text-faint">
                {key}
              </span>
              <Input
                value={String(value ?? "")}
                onChange={(e) =>
                  setRecord((prev) => ({ ...prev, [key]: coerce(value, e.target.value) }))
                }
              />
            </label>
          ))}
        </div>
      ) : (
        <dl className="space-y-1">
          {action.fields.map((f, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-secondary">{f.label}</dt>
              <dd className="font-mono text-primary">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => confirm({ ...action, record })}
          disabled={executing}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-contrast hover:bg-accent-hover disabled:opacity-60"
        >
          {executing ? "Creating…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          disabled={executing}
          className="rounded-md border border-border-strong bg-surface-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface-2 disabled:opacity-60"
        >
          {editing ? "Done editing" : "Edit"}
        </button>
        <button
          type="button"
          onClick={() => cancel(action)}
          disabled={executing}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      <p className="text-[0.7rem] leading-snug text-faint">
        Nothing is written until you confirm — and it’s undoable afterwards.
      </p>
    </div>
  );
}

/** Preserve numeric record fields when edited; everything else stays a string. */
function coerce(original: unknown, next: string): unknown {
  if (typeof original === "number" && next.trim() !== "" && !Number.isNaN(Number(next))) {
    return Number(next);
  }
  return next;
}

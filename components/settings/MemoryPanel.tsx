"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Textarea } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { useDeleteMemory, useMemories, useUpdateMemory } from "@/lib/account/hooks";
import type { CopilotMemory } from "@/lib/account/types";

/**
 * MemoryPanel — view, edit and delete what the copilot remembers about you and your org.
 * Full user control over the memory feature: nothing is hidden, everything is editable and
 * deletable.
 */
export function MemoryPanel() {
  const memories = useMemories();
  const items = memories.data?.items ?? [];

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-primary">What the copilot remembers</h3>
        <p className="mt-0.5 text-sm text-secondary">
          Facts the copilot has saved about you and your organization. You can edit or delete
          any of them — it only uses what’s here.
        </p>
      </div>

      <Banner variant="info">
        Memories help the copilot stay consistent across sessions. Removing one means it forgets that fact.
      </Banner>

      {memories.isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : memories.isError ? (
        <p className="text-sm text-faint">Couldn’t load memories.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-secondary">The copilot hasn’t saved any memories yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((m) => (
            <MemoryRow key={m.id} memory={m} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function MemoryRow({ memory }: { memory: CopilotMemory }) {
  const { show } = useToast();
  const update = useUpdateMemory();
  const del = useDeleteMemory();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(memory.content);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function save() {
    update.mutate(
      { id: memory.id, content: draft.trim() },
      {
        onSuccess: () => {
          setEditing(false);
          show({ message: "Memory updated", tone: "success" });
        },
        onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
      },
    );
  }

  function remove() {
    del.mutate(memory.id, {
      onSuccess: () => show({ message: "Memory deleted", tone: "default" }),
      onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
    });
  }

  return (
    <li className="rounded-md border border-border-subtle bg-surface-1 p-3">
      {editing ? (
        <div className="space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} />
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={update.isPending || draft.trim() === ""}>
              {update.isPending ? "Saving…" : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(memory.content);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-secondary">{memory.content}</p>
            {memory.kind && <p className="mt-1 font-mono text-xs text-faint">{memory.kind}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  onClick={remove}
                  disabled={del.isPending}
                  className="rounded-sm px-2 py-1 text-xs font-medium text-danger hover:bg-surface-2 disabled:opacity-50"
                >
                  {del.isPending ? "…" : "Confirm"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-sm px-2 py-1 text-xs text-secondary hover:bg-surface-2"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-sm px-2 py-1 text-xs text-secondary hover:bg-surface-2 hover:text-primary"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-sm px-2 py-1 text-xs text-secondary hover:bg-surface-2 hover:text-danger"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

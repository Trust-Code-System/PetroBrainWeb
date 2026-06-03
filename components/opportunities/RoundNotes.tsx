"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { Markdown } from "@/components/copilot/Markdown";
import { useCreateNote, useDeleteNote } from "@/lib/opportunities/hooks";
import { fmtDate } from "@/lib/opportunities/labels";
import type { RoundNote } from "@/lib/opportunities/types";

/**
 * RoundNotes — team-visible notes on a round. Follows the app's safe-write pattern: an
 * explicit "Add note" action, a success toast with UNDO (delete the just-created note), and a
 * best-effort audit-log entry. Markdown is allowed in the body. This is the only write in the
 * Opportunities v1 (a copilot-driven create_round_note is a documented plug-point, not wired).
 */
export function RoundNotes({ roundId, notes }: { roundId: string; notes?: RoundNote[] }) {
  const { show } = useToast();
  const create = useCreateNote(roundId);
  const remove = useDeleteNote(roundId);
  const [draft, setDraft] = useState("");

  function save() {
    const body = draft.trim();
    if (!body) return;
    create.mutate(body, {
      onSuccess: (note) => {
        setDraft("");
        postAudit(roundId, note.id);
        show({
          message: "Note added",
          tone: "success",
          undo: () =>
            remove.mutate(note.id, {
              onSuccess: () => show({ message: "Note removed", tone: "default" }),
              onError: () => show({ message: "Couldn’t remove the note.", tone: "danger" }),
            }),
        });
      },
      onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
    });
  }

  const items = notes ?? [];

  return (
    <div className="space-y-3">
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id} className="rounded-md border border-border-subtle bg-surface-2 p-3">
              <div className="prose-invert text-sm text-primary">
                <Markdown>{n.body_md}</Markdown>
              </div>
              <p className="mt-1.5 text-xs text-faint">
                {n.author ?? "Team"}
                {n.created_at ? ` · ${fmtDate(n.created_at)}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-faint">No notes yet — add the first for your team.</p>
      )}

      <div>
        <label htmlFor={`note-${roundId}`} className="sr-only">
          Add a note
        </label>
        <textarea
          id={`note-${roundId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Add a note for your team (markdown allowed)…"
          className="w-full rounded-md border border-border-strong bg-surface-1 px-3 py-2 text-sm text-primary placeholder:text-faint focus-visible:border-grey-600 focus-visible:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={save} disabled={!draft.trim() || create.isPending}>
            {create.isPending ? "Saving…" : "Add note"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Best-effort audit trail (assumed POST /audit) — mirrors AppActionProvider; never blocks. */
function postAudit(roundId: string, noteId: string) {
  void fetch("/api/pb/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `note_${Date.now()}`,
      at: new Date().toISOString(),
      kind: "create_round_note",
      summary: `Added note to round ${roundId}`,
      recordType: "round_note",
      recordId: noteId,
      undoable: true,
      status: "committed",
    }),
  }).catch(() => {});
}

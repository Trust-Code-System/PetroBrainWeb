// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AppActionProvider, useAppActions } from "@/components/copilot/AppActionProvider";
import { ActionCard } from "@/components/copilot/ActionCard";
import type { CreateRecordAction } from "@/lib/copilot/actions";

// AppActionProvider uses next/navigation's useRouter.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const action: CreateRecordAction = {
  id: "act1",
  kind: "create_record",
  recordType: "emission_source",
  title: "Create emission record",
  summary: "Flaring at OML-X, last week",
  fields: [
    { label: "Asset", value: "OML-X" },
    { label: "Quantity", value: "2 MMscf" },
  ],
  record: {
    assetId: "OML-X",
    scope: "scope_1",
    category: "flaring",
    source: "Routine flare",
    period: "2026-05",
    quantity: 2,
    unit: "MMscf",
  },
};

/** Surfaces the audit trail so the test can assert entries. */
function AuditProbe() {
  const { audit } = useAppActions();
  return (
    <ul data-testid="audit">
      {audit.map((e) => (
        <li key={e.id}>{`${e.summary} — ${e.status}`}</li>
      ))}
    </ul>
  );
}

function renderUnderProviders() {
  return render(
    <QueryProvider>
      <ToastProvider>
        <AppActionProvider>
          <ActionCard action={action} />
          <AuditProbe />
        </AppActionProvider>
      </ToastProvider>
    </QueryProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ id: "EM-1042" }) }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Copilot app actions: confirm → write → audit → undo", () => {
  it("requires confirmation, then writes, audits and supports undo", async () => {
    renderUnderProviders();
    const fetchMock = vi.mocked(fetch);

    // Proposed write shows a confirmation card — nothing written yet.
    expect(screen.getByText("Create emission record")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    // Confirm → POST to the create endpoint.
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(await screen.findByText(/Copilot created EM-1042/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pb/emissions/sources",
      expect.objectContaining({ method: "POST" }),
    );
    // Audit trail records the committed write.
    expect(await screen.findByText("Created emission record EM-1042 — committed")).toBeInTheDocument();

    // Undo → DELETE the created record; audit flips to undone.
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    expect(await screen.findByText(/Undone — EM-1042 removed/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pb/emissions/sources/EM-1042",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(await screen.findByText("Created emission record EM-1042 — undone")).toBeInTheDocument();
  });

  it("cancel writes nothing", async () => {
    renderUnderProviders();
    const fetchMock = vi.mocked(fetch);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await screen.findByText(/Cancelled/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

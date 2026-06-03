// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { NotificationBell } from "@/components/app/NotificationBell";

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      if (url.includes("/api/pb/notifications") && (init?.method ?? "GET") === "GET") {
        return Promise.resolve(
          jsonResponse({
            unread: 1,
            items: [
              { id: "n1", kind: "deadline", title: "NUPRC Tier-3 due in 30 days", severity: "warn", read: false },
              { id: "n2", kind: "task", title: "Copilot created EM-1042", read: true },
            ],
          }),
        );
      }
      return Promise.resolve(jsonResponse({ ok: true }));
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function renderBell() {
  return render(
    <QueryProvider>
      <NotificationBell />
    </QueryProvider>,
  );
}

describe("NotificationBell", () => {
  it("shows an unread count and lists real notifications", async () => {
    renderBell();
    const trigger = await screen.findByRole("button", { name: /1 unread/i }, { timeout: 5000 });
    fireEvent.click(trigger);
    expect(await screen.findByText("NUPRC Tier-3 due in 30 days", {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText("Copilot created EM-1042")).toBeInTheDocument();
  });

  it("marks all read via the backend", async () => {
    renderBell();
    fireEvent.click(await screen.findByRole("button", { name: /1 unread/i }, { timeout: 5000 }));
    fireEvent.click(await screen.findByRole("button", { name: /Mark all read/i }, { timeout: 5000 }));
    await waitFor(() => {
      const called = vi
        .mocked(fetch)
        .mock.calls.some(([url, init]) => String(url).includes("/notifications/read-all") && init?.method === "POST");
      expect(called).toBe(true);
    });
  });
});

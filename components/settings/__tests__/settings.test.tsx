// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { MemoryPanel } from "@/components/settings/MemoryPanel";
import { LANGUAGE_OPTIONS } from "@/lib/account/labels";

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body } as Response;
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (url.includes("/api/pb/memory") && method === "GET") {
        return Promise.resolve(jsonResponse({ items: [{ id: "m1", content: "Prefers metric units", kind: "user" }] }));
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

function renderPanel() {
  return render(
    <QueryProvider>
      <ToastProvider>
        <MemoryPanel />
      </ToastProvider>
    </QueryProvider>,
  );
}

describe("MemoryPanel — copilot memory controls", () => {
  it("lists memories and deletes one (two-step confirm → DELETE)", async () => {
    renderPanel();
    expect(await screen.findByText("Prefers metric units")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    expect(await screen.findByText(/Memory deleted/)).toBeInTheDocument();
    const fetchMock = vi.mocked(fetch);
    const deleted = fetchMock.mock.calls.some(
      ([url, init]) => String(url).includes("/api/pb/memory/m1") && (init as RequestInit)?.method === "DELETE",
    );
    expect(deleted).toBe(true);
  });
});

describe("language options", () => {
  it("offers English live and the others as disabled placeholders", () => {
    const en = LANGUAGE_OPTIONS.find((o) => o.value === "en");
    const others = LANGUAGE_OPTIONS.filter((o) => o.value !== "en");
    expect(en?.disabled).toBeFalsy();
    expect(others.every((o) => o.disabled)).toBe(true);
  });
});

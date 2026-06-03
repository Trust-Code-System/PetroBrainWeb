// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChromeProvider } from "@/components/app/ChromeProvider";
import { PageContextProvider, useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { CopilotBubble } from "@/components/app/CopilotBubble";

// The page-context provider derives its route from usePathname — pin it to the dashboard.
vi.mock("next/navigation", () => ({ usePathname: () => "/app" }));

/** A mocked orchestrator SSE stream: streamed answer + a citation + a verification banner. */
const FRAMES = [
  'data: {"type":"delta","text":"Brent is "}\n\n',
  'data: {"type":"delta","text":"$82.10/bbl. For a marginal field this matters."}\n\n',
  'data: {"type":"citation","citation":{"source":"EIA spot prices"}}\n\n',
  'data: {"type":"banner","banner":{"variant":"warn","title":"Verify before acting","text":"Decision-support only."}}\n\n',
  'data: {"type":"done"}\n\n',
];

function streamOf(frames: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const f of frames) controller.enqueue(enc.encode(f));
      controller.close();
    },
  });
}

/** Harness: registers a fake page context (market data) then renders the copilot. */
function Harness() {
  useRegisterPageContext({
    data: { market: { prices: [{ benchmark: "Brent", usdPerBbl: 82.1, asOf: "2026-05-30" }] } },
  });
  return <CopilotBubble />;
}

function renderCopilot() {
  return render(
    <ChromeProvider>
      <PageContextProvider>
        <Harness />
      </PageContextProvider>
    </ChromeProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, body: streamOf(FRAMES) }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("CopilotBubble (streamed, page-aware, read-only)", () => {
  it("streams a cited answer and sends the page's market data as context", async () => {
    renderCopilot();

    // Open the panel (its content is excluded from the a11y tree while closed).
    fireEvent.click(screen.getByRole("button", { name: /open copilot/i }));

    const question = "what's Brent today and what does it mean for a marginal field?";
    fireEvent.change(screen.getByRole("textbox"), { target: { value: question } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    // Streamed markdown answer renders (both deltas concatenated).
    expect(await screen.findByText(/\$82\.10\/bbl\. For a marginal field/)).toBeInTheDocument();
    // Citation chip + verification banner render.
    expect(await screen.findByText(/EIA spot prices/)).toBeInTheDocument();
    expect(await screen.findByText(/Verify before acting/)).toBeInTheDocument();
    expect(screen.getByText(/Decision-support only/)).toBeInTheDocument();
    // The user's question is shown.
    expect(screen.getByText(question)).toBeInTheDocument();

    // The request carried the page context (route + the dashboard's market data).
    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledWith("/api/copilot/chat", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse((fetchMock.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(body.pageContext.route).toBe("/app");
    expect(body.pageContext.data.market.prices[0].usdPerBbl).toBe(82.1);
    expect(body.messages.at(-1)).toMatchObject({ role: "user", content: question });
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// jsdom doesn't implement scrollIntoView, which the Select listbox calls when it opens.
Element.prototype.scrollIntoView = vi.fn();

// --- mock the data/UI hooks so the presentational components render without providers ---
const mutation = { mutate: vi.fn(), isPending: false };
vi.mock("@/lib/opportunities/hooks", () => ({
  useToggleWatch: () => mutation,
  useAssignRound: () => mutation,
  useCreateNote: () => mutation,
  useDeleteNote: () => mutation,
}));
vi.mock("@/lib/account/hooks", () => ({
  useTeam: () => ({ data: { items: [] }, isLoading: false }),
}));
vi.mock("@/components/providers/ToastProvider", () => ({
  useToast: () => ({ show: vi.fn() }),
}));

import { RoundsTable } from "@/components/opportunities/RoundsTable";
import { OpportunityFilters } from "@/components/opportunities/OpportunityFilters";
import { RoundDetail } from "@/components/opportunities/RoundDetail";
import { IngestionGapNote } from "@/components/opportunities/IngestionGapNote";
import type { Round, RoundFilters } from "@/lib/opportunities/types";

afterEach(cleanup);

function makeRound(over: Partial<Round> = {}): Round {
  return {
    id: "r1",
    name: "Test Round",
    regulator: "NUPRC",
    country: "NG",
    type: "deep_offshore",
    status: "open",
    submission_deadline: "2026-09-01T00:00:00Z",
    blocks: [],
    documents: [],
    activity: [],
    source_attribution: {
      regulator: "NUPRC",
      source_url: "https://nuprc.gov.ng/round",
      last_verified_at: "2026-06-01T00:00:00Z",
    },
    counts: { blocks: 0, documents: 0 },
    ...over,
  };
}

describe("RoundsTable", () => {
  it("renders rows and sorts by deadline (soonest first) by default", () => {
    const rounds = [
      makeRound({ id: "late", name: "Late Round", submission_deadline: "2026-12-01T00:00:00Z" }),
      makeRound({ id: "soon", name: "Soon Round", submission_deadline: "2026-07-01T00:00:00Z" }),
      makeRound({ id: "mid", name: "Mid Round", submission_deadline: "2026-09-01T00:00:00Z" }),
    ];
    render(<RoundsTable rounds={rounds} onOpen={() => {}} onNotes={() => {}} />);

    const dataRows = screen.getAllByRole("row").slice(1); // drop the header row
    const names = dataRows.map((r) => r.querySelector("td")?.textContent);
    expect(names).toEqual(["Soon Round", "Mid Round", "Late Round"]);
  });

  it("opens a round when its row is activated", () => {
    const onOpen = vi.fn();
    render(<RoundsTable rounds={[makeRound({ id: "r9", name: "Bonga Round" })]} onOpen={onOpen} onNotes={() => {}} />);
    fireEvent.click(screen.getByText("Bonga Round"));
    expect(onOpen).toHaveBeenCalledWith("r9");
  });

  it("shows an honest empty message when there are no rounds", () => {
    render(<RoundsTable rounds={[]} onOpen={() => {}} onNotes={() => {}} />);
    expect(screen.getByText(/No rounds match these filters/i)).toBeInTheDocument();
  });
});

describe("OpportunityFilters", () => {
  const filters: RoundFilters = {
    country: ["NG"],
    type: "",
    status: "",
    segment: "upstream",
    q: "",
    sort: "deadline",
  };

  it("emits a keyword change from the search box", () => {
    const onChange = vi.fn();
    render(<OpportunityFilters filters={filters} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText(/Round or block name/i), {
      target: { value: "deep" },
    });
    expect(onChange).toHaveBeenCalledWith({ q: "deep" });
  });

  it("emits a status change when an option is picked", () => {
    const onChange = vi.fn();
    render(<OpportunityFilters filters={filters} onChange={onChange} />);
    fireEvent.click(screen.getByRole("combobox", { name: /status/i }));
    fireEvent.click(screen.getByRole("option", { name: "Open" }));
    expect(onChange).toHaveBeenCalledWith({ status: "open" });
  });
});

describe("RoundDetail", () => {
  it("renders source attribution and honest dashes for unknown fields", () => {
    const round = makeRound({
      blocks: [{ name: "OPL-2026" }], // no basin/area/water_depth/prior_activity
      counts: { blocks: 1, documents: 0 },
      // no fiscal_regime_tag, no signature_bonus_floor
    });
    render(<RoundDetail round={round} onAskCopilot={() => {}} />);

    // Source attribution with the regulator link + "verified" timestamp.
    const link = screen.getByRole("link", { name: "NUPRC" });
    expect(link).toHaveAttribute("href", "https://nuprc.gov.ng/round");
    expect(screen.getByText(/verified/i)).toBeInTheDocument();

    // Unknown fiscal/block fields render "—", never 0 or a guess.
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);

    // The descriptive (not bid advice) disclaimer is present.
    expect(screen.getByText(/does not recommend whether to bid/i)).toBeInTheDocument();
  });
});

describe("IngestionGapNote", () => {
  it("states regulators we don't yet ingest", () => {
    render(
      <IngestionGapNote
        ingestion={{ gaps: [{ regulator: "Ghana Petroleum Commission", country: "GH" }] }}
        onAskCopilot={() => {}}
      />,
    );
    expect(screen.getByText(/not yet ingesting Ghana Petroleum Commission/i)).toBeInTheDocument();
  });

  it("renders nothing when there are no gaps", () => {
    const { container } = render(<IngestionGapNote ingestion={{ gaps: [] }} onAskCopilot={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

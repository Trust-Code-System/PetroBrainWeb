// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { DocumentList } from "@/components/documents/DocumentList";
import type { DocItem } from "@/lib/documents/types";

afterEach(cleanup);

const items: DocItem[] = [
  { id: "d1", name: "Well Control SOP", type: "sop", revision: "v3", status: "ingested", sizeBytes: 524288 },
  { id: "d2", name: "Flaring Standard", type: "standard", status: "processing" },
  { id: "d3", name: "Old Report", type: "report", status: "failed", ingestion: { error: "Unreadable PDF" } },
];

describe("DocumentList", () => {
  it("shows ingestion status per document, including a failure reason", () => {
    render(<DocumentList items={items} isLoading={false} isError={false} filtered={false} />);
    expect(screen.getByText("Well Control SOP")).toBeInTheDocument();
    expect(screen.getByText("Ingested")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Unreadable PDF")).toBeInTheDocument();
  });

  it("invites an upload (mentioning the copilot) when empty and unfiltered", () => {
    render(<DocumentList items={[]} isLoading={false} isError={false} filtered={false} />);
    expect(screen.getByText(/the copilot can cite them/i)).toBeInTheDocument();
  });

  it("shows a filter-specific empty message when filtered", () => {
    render(<DocumentList items={[]} isLoading={false} isError={false} filtered />);
    expect(screen.getByText(/No documents match these filters/i)).toBeInTheDocument();
  });
});

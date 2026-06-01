"use client";

import { useState } from "react";
import { Select, MultiSelect, type SelectOption } from "@/components/ui/Select";

/**
 * SelectShowcase — styleguide-only. Exercises the themed Select / MultiSelect in every
 * state (default, preselected, disabled, error, mono variant, multi-select) so the
 * control can be reviewed in isolation. Open/focus states are interactive — click or tab
 * in and use the keyboard (↑/↓, Home/End, Enter, Esc, type-ahead).
 */

const SEGMENTS: SelectOption[] = [
  { label: "Upstream", value: "Upstream" },
  { label: "Midstream", value: "Midstream" },
  { label: "Downstream", value: "Downstream" },
  { label: "Multiple", value: "Multiple" },
];

const PIPE_GRADES: SelectOption[] = [
  { label: "API 5L X42", value: "X42" },
  { label: "API 5L X52", value: "X52" },
  { label: "API 5L X60", value: "X60" },
  { label: "API 5L X65", value: "X65" },
  { label: "API 5L X70 (on request)", value: "X70", disabled: true },
];

const FRAMEWORKS: SelectOption[] = [
  { label: "NUPRC GHGEMP", value: "ghgemp" },
  { label: "OGMP 2.0", value: "ogmp2" },
  { label: "CSRD", value: "csrd" },
  { label: "ISO 14064", value: "iso14064" },
];

export function SelectShowcase() {
  const [segment, setSegment] = useState("");
  const [preset, setPreset] = useState("Midstream");
  const [grade, setGrade] = useState("X52");
  const [frameworks, setFrameworks] = useState<string[]>(["ghgemp", "ogmp2"]);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Select
        label="Default (with helper)"
        options={SEGMENTS}
        value={segment}
        onChange={setSegment}
        placeholder="Select a segment…"
        helperText="Click or focus and press ↓ / type-ahead to open."
      />

      <Select
        label="Preselected value"
        options={SEGMENTS}
        value={preset}
        onChange={setPreset}
      />

      <Select
        label="Disabled"
        options={SEGMENTS}
        value="Upstream"
        onChange={() => {}}
        disabled
      />

      <Select
        label="With error"
        required
        options={SEGMENTS}
        value=""
        onChange={() => {}}
        placeholder="Select a segment…"
        error="Pick the closest segment."
      />

      <Select
        label="Mono variant — technical values"
        mono
        options={PIPE_GRADES}
        value={grade}
        onChange={setGrade}
        helperText="For technical/mono values; one option is disabled."
      />

      <MultiSelect
        label="Multi-select — reporting frameworks"
        options={FRAMEWORKS}
        value={frameworks}
        onChange={setFrameworks}
        placeholder="Select frameworks…"
        helperText="Stays open while you toggle; Enter/Space toggles the active row."
      />
    </div>
  );
}

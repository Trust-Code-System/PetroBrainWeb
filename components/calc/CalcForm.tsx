"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import type { CalcDef, CalcInputs } from "@/lib/calc/types";

/**
 * CalcForm — renders a calc's fields from the catalog (numeric inputs with per-field unit
 * selectors, plus plain selects for conversion targets), validates, and emits the inputs.
 * It does NOT compute — submit hands the inputs to the backend engine. Mount with a key of
 * the calc id so switching calcs resets the form.
 */
export function CalcForm({
  def,
  onSubmit,
  submitting,
  error,
}: {
  def: CalcDef;
  onSubmit: (inputs: CalcInputs) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<Record<string, string>>(() => {
    const u: Record<string, string> = {};
    for (const f of def.fields) {
      if (f.kind === "number" && f.units?.[0]) u[f.key] = f.units[0].value;
      if (f.kind === "select" && f.options[0]) u[f.key] = f.options[0].value;
    }
    return u;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const inputs: CalcInputs = {};

    for (const f of def.fields) {
      if (f.kind === "select") {
        inputs[f.key] = units[f.key] ?? f.options[0]?.value ?? "";
        continue;
      }
      const raw = (values[f.key] ?? "").trim();
      const num = Number(raw);
      if (raw === "" || Number.isNaN(num)) {
        nextErrors[f.key] = "Enter a number.";
        continue;
      }
      inputs[f.key] = f.units ? { value: num, unit: units[f.key] } : { value: num };
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(inputs);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <Banner variant="danger" title="Couldn’t run the calculation">
          {error}
        </Banner>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {def.fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label htmlFor={`calc-${f.key}`} className="block text-sm font-medium text-primary">
              {f.label}
            </label>
            {f.hint && <p className="text-xs text-faint">{f.hint}</p>}

            {f.kind === "select" ? (
              <Select
                id={`calc-${f.key}`}
                options={f.options}
                value={units[f.key] ?? ""}
                onChange={(v) => setUnits((p) => ({ ...p, [f.key]: v }))}
              />
            ) : f.units ? (
              <div className="flex gap-2">
                <Input
                  id={`calc-${f.key}`}
                  inputMode="decimal"
                  className="flex-1"
                  placeholder={f.placeholder}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                  aria-invalid={errors[f.key] ? true : undefined}
                />
                <div className="w-24 shrink-0">
                  <Select
                    options={f.units}
                    value={units[f.key] ?? f.units[0]?.value ?? ""}
                    onChange={(v) => setUnits((p) => ({ ...p, [f.key]: v }))}
                    mono
                  />
                </div>
              </div>
            ) : (
              <Input
                id={`calc-${f.key}`}
                inputMode="decimal"
                placeholder={f.placeholder}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                aria-invalid={errors[f.key] ? true : undefined}
              />
            )}

            {errors[f.key] && <p className="text-xs text-danger">{errors[f.key]}</p>}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Calculating…" : "Calculate"}
      </Button>
    </form>
  );
}

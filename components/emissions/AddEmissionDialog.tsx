"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { CloseIcon, SparkleIcon } from "@/components/app/icons";
import { SCOPE_OPTIONS, CATEGORY_OPTIONS } from "@/lib/emissions/labels";
import type { CreateEmissionInput, EmissionCategory, EmissionScope } from "@/lib/emissions/types";

/**
 * AddEmissionDialog — modal form to add an emission source. The CO₂e is computed by the
 * backend engine after submit (no client-side math here). Offers the copilot path too:
 * "Tell the copilot" opens it pre-seeded to add a record conversationally.
 */

type FieldKey = keyof CreateEmissionInput;
const EMPTY = {
  assetId: "",
  scope: "scope_1" as EmissionScope,
  category: "flaring" as EmissionCategory,
  source: "",
  period: "",
  quantity: "",
  unit: "",
};

export function AddEmissionDialog({
  open,
  onClose,
  assetOptions,
  onSubmit,
  submitting,
  error,
  onTellCopilot,
}: {
  open: boolean;
  onClose: () => void;
  assetOptions: SelectOption[];
  onSubmit: (input: CreateEmissionInput) => void;
  submitting: boolean;
  error: string | null;
  onTellCopilot: () => void;
}) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const firstRef = useRef<HTMLButtonElement>(null);

  // Reset + focus when opened; Escape to close.
  useEffect(() => {
    if (!open) return;
    setValues(EMPTY);
    setErrors({});
    const id = window.setTimeout(() => firstRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<FieldKey, string>> = {};
    if (!values.assetId) next.assetId = "Choose an asset.";
    if (!values.source.trim()) next.source = "Name the source.";
    if (!values.period.trim()) next.period = "Set the period.";
    if (!values.unit.trim()) next.unit = "Set the unit.";
    const quantity = Number(values.quantity);
    if (!values.quantity.trim() || Number.isNaN(quantity)) next.quantity = "Enter a number.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      assetId: values.assetId,
      scope: values.scope,
      category: values.category,
      source: values.source.trim(),
      period: values.period.trim(),
      quantity,
      unit: values.unit.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-emission-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-lg sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="add-emission-title" className="text-lg font-semibold text-primary">
              Add emission
            </h2>
            <p className="mt-0.5 text-sm text-secondary">
              The engine computes CO₂e from these inputs.
            </p>
          </div>
          <button
            ref={firstRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <Banner variant="danger" title="Couldn’t add the emission" className="mb-4">
            {error}
          </Banner>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Select
            label="Asset"
            required
            options={assetOptions}
            value={values.assetId}
            onChange={(v) => setValues((p) => ({ ...p, assetId: v }))}
            placeholder="Select an asset…"
            error={errors.assetId}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Scope"
              required
              options={SCOPE_OPTIONS}
              value={values.scope}
              onChange={(v) => setValues((p) => ({ ...p, scope: v as EmissionScope }))}
            />
            <Select
              label="Category"
              required
              options={CATEGORY_OPTIONS}
              value={values.category}
              onChange={(v) => setValues((p) => ({ ...p, category: v as EmissionCategory }))}
            />
          </div>

          <Field id="source" label="Source" required error={errors.source}>
            <Input
              value={values.source}
              onChange={(e) => setValues((p) => ({ ...p, source: e.target.value }))}
              placeholder="e.g. HP flare — Train 1"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="quantity" label="Quantity" required error={errors.quantity}>
              <Input
                inputMode="decimal"
                value={values.quantity}
                onChange={(e) => setValues((p) => ({ ...p, quantity: e.target.value }))}
                placeholder="0"
              />
            </Field>
            <Field id="unit" label="Unit" required error={errors.unit}>
              <Input
                value={values.unit}
                onChange={(e) => setValues((p) => ({ ...p, unit: e.target.value }))}
                placeholder="e.g. Mscf, t"
              />
            </Field>
            <Field id="period" label="Period" required error={errors.period}>
              <Input
                type="month"
                value={values.period}
                onChange={(e) => setValues((p) => ({ ...p, period: e.target.value }))}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row-reverse sm:items-center sm:justify-start">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add emission"}
            </Button>
            <Button type="button" variant="ghost" onClick={onTellCopilot}>
              <SparkleIcon className="h-4 w-4 text-accent" />
              Tell the copilot instead
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

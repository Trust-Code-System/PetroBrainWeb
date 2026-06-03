"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { CloseIcon } from "@/components/app/icons";
import { ASSET_TYPE_OPTIONS } from "@/lib/assets/labels";
import type { Asset, AssetType, CreateAssetInput } from "@/lib/assets/types";

/**
 * AssetFormDialog — create or edit an asset. Lat/lon are optional (an asset can exist
 * without a location; it just won't plot on the map). On submit the parent calls the
 * A9 backend; this dialog stays dumb about transport.
 */
export function AssetFormDialog({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial?: Asset;
  onClose: () => void;
  onSubmit: (input: CreateAssetInput) => void;
  submitting: boolean;
  error: string | null;
}) {
  const [values, setValues] = useState({
    name: "",
    type: "field" as AssetType,
    operator: "",
    lat: "",
    lon: "",
  });
  const [errors, setErrors] = useState<{ name?: string; lat?: string; lon?: string }>({});
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setValues({
      name: initial?.name ?? "",
      type: initial?.type ?? "field",
      operator: initial?.operator ?? "",
      lat: initial?.lat != null ? String(initial.lat) : "",
      lon: initial?.lon != null ? String(initial.lon) : "",
    });
    setErrors({});
    const id = window.setTimeout(() => closeRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, initial, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Name the asset.";
    const lat = values.lat.trim() === "" ? null : Number(values.lat);
    const lon = values.lon.trim() === "" ? null : Number(values.lon);
    if (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) next.lat = "Latitude must be −90…90.";
    if (lon !== null && (Number.isNaN(lon) || lon < -180 || lon > 180)) next.lon = "Longitude must be −180…180.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      name: values.name.trim(),
      type: values.type,
      operator: values.operator.trim() || undefined,
      lat,
      lon,
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="asset-form-title"
        className="relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-lg border border-border-subtle bg-surface-1 p-5 shadow-elev-3 sm:max-w-lg sm:rounded-lg sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="asset-form-title" className="text-lg font-semibold text-primary">
            {mode === "create" ? "Add asset" : "Edit asset"}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-secondary hover:bg-surface-2 hover:text-primary"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <Banner variant="danger" title="Couldn’t save the asset" className="mb-4">
            {error}
          </Banner>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Field id="name" label="Name" required error={errors.name}>
            <Input
              value={values.name}
              onChange={(e) => setValues((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Bonga North field"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              required
              options={ASSET_TYPE_OPTIONS}
              value={values.type}
              onChange={(v) => setValues((p) => ({ ...p, type: v as AssetType }))}
            />
            <Field id="operator" label="Operator">
              <Input
                value={values.operator}
                onChange={(e) => setValues((p) => ({ ...p, operator: e.target.value }))}
                placeholder="Optional"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="lat" label="Latitude" hint="Optional" error={errors.lat}>
              <Input
                inputMode="decimal"
                value={values.lat}
                onChange={(e) => setValues((p) => ({ ...p, lat: e.target.value }))}
                placeholder="e.g. 4.75"
              />
            </Field>
            <Field id="lon" label="Longitude" hint="Optional" error={errors.lon}>
              <Input
                inputMode="decimal"
                value={values.lon}
                onChange={(e) => setValues((p) => ({ ...p, lon: e.target.value }))}
                placeholder="e.g. 5.10"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : mode === "create" ? "Add asset" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

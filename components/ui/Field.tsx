"use client";

import { cloneElement, isValidElement } from "react";
import { cn } from "@/lib/cn";

/**
 * Field — accessible label + control wrapper. Wires the label, optional hint, and
 * error message to the child control via id / aria-describedby / aria-invalid so you
 * don't repeat that plumbing per field. Pass a single form control as the child.
 *
 * Usage:
 *   <Field id="email" label="Work email" required error={errors.email}>
 *     <Input type="email" value={…} onChange={…} />
 *   </Field>
 */
type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
};

export function Field({ id, label, hint, error, required, children, className }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        name: (children.props as { name?: string }).name ?? id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required ? true : undefined,
      })
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-primary">
        {label}
        {required && (
          <span className="ml-0.5 text-accent" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-faint">
          {hint}
        </p>
      )}
      {control}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

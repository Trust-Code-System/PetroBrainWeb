import { cn } from "@/lib/cn";

/**
 * Form control primitives — shared dark styling, AA contrast, focus ring (global),
 * and an invalid state driven by aria-invalid. Pair with <Field> for labels/errors.
 */
export const controlBase =
  "w-full rounded-md border border-border-strong bg-surface-1 px-3.5 text-sm text-primary placeholder:text-faint transition-colors hover:border-grey-600 disabled:opacity-50 aria-[invalid=true]:border-danger";

export function Input({ className, type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  // Default type="text" so the rendered <input> is always classified as a text control —
  // without it, WCAG 1.3.5 (autocomplete tokens like "name"/"organization") can't resolve
  // the control group. Callers passing type="email"/"password" override this.
  return <input type={type} className={cn(controlBase, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cn(controlBase, "min-h-[7rem] py-2.5 leading-relaxed", className)} {...props} />;
}

// NOTE: the dropdown control now lives in components/ui/Select.tsx — a fully themed,
// accessible listbox (no native <select> anywhere on the site).

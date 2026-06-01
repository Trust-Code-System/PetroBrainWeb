"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Select / MultiSelect — fully themed, accessible listbox controls that replace the
 * native <select> everywhere on the site. No browser-default option list: the dropdown
 * panel is our own dark "control-room" surface (slate panel, amber active state,
 * cool-grey text, mono variant for technical values).
 *
 * Accessibility: implements the WAI-ARIA select-only combobox pattern. The trigger is a
 * role="combobox" button; the panel is a role="listbox" of role="option" items. Focus
 * stays on the trigger and the active option is tracked with aria-activedescendant.
 * Keyboard: ↑/↓ move, Home/End jump, Enter/Space select (MultiSelect toggles), Esc
 * closes, type-ahead jumps to a matching label, Tab closes. Open/close animation is
 * suppressed for prefers-reduced-motion via the global CSS rule.
 *
 * Single-select today; MultiSelect (below) shares the same primitives for the cases that
 * genuinely need it. Both are controlled.
 */

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

/* ---------- shared styling ---------- */

function triggerClass(open: boolean, hasError: boolean, mono: boolean) {
  return cn(
    "relative flex h-11 w-full items-center justify-between gap-2 rounded-md border bg-surface-1 px-3.5 text-left text-sm transition-colors",
    "hover:border-grey-600 disabled:cursor-not-allowed disabled:opacity-50",
    hasError ? "border-danger" : open ? "border-grey-600" : "border-border-strong",
    mono && "font-mono",
  );
}

const PANEL_CLASS =
  "absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border-strong bg-surface-1 p-1 shadow-elev-3 animate-online-in";

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 shrink-0 text-faint transition-transform", open && "rotate-180")}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-4 w-4 shrink-0", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OptionRow({
  id,
  option,
  selected,
  active,
  mono,
  onSelect,
  onActivate,
  setRef,
}: {
  id: string;
  option: SelectOption;
  selected: boolean;
  active: boolean;
  mono: boolean;
  onSelect: () => void;
  onActivate: () => void;
  setRef: (el: HTMLLIElement | null) => void;
}) {
  const disabled = !!option.disabled;
  return (
    <li
      id={id}
      ref={setRef}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      // Keep focus on the combobox trigger when clicking an option.
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => !disabled && onSelect()}
      onMouseEnter={() => !disabled && onActivate()}
      className={cn(
        "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm",
        active ? "bg-accent-muted text-primary" : selected ? "text-primary" : "text-secondary",
        disabled && "cursor-not-allowed opacity-40",
        mono && "font-mono",
      )}
    >
      <span className="truncate">{option.label}</span>
      {selected && <Check className="text-accent" />}
    </li>
  );
}

/** Field-style label + helper/error chrome, shared by Select and MultiSelect. */
function FieldChrome({
  labelId,
  label,
  required,
  helperId,
  helperText,
  errorId,
  error,
  className,
  children,
}: {
  labelId: string;
  label?: string;
  required?: boolean;
  helperId: string;
  helperText?: string;
  errorId: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label id={labelId} className="block text-sm font-medium text-primary">
          {label}
          {required && (
            <span className="ml-0.5 text-accent" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {helperText && (
        <p id={helperId} className="text-xs text-faint">
          {helperText}
        </p>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- keyboard helpers ---------- */

function nextEnabled(options: SelectOption[], from: number, dir: 1 | -1): number {
  const n = options.length;
  for (let step = 1; step <= n; step++) {
    const i = (from + dir * step + n * step) % n;
    if (!options[i]?.disabled) return i;
  }
  return from;
}

function firstEnabled(options: SelectOption[]): number {
  const i = options.findIndex((o) => !o.disabled);
  return i === -1 ? 0 : i;
}

function lastEnabled(options: SelectOption[]): number {
  for (let i = options.length - 1; i >= 0; i--) if (!options[i]?.disabled) return i;
  return options.length - 1;
}

/** Shared type-ahead: returns the index of the next option whose label starts with buf. */
function typeAheadIndex(options: SelectOption[], buf: string, from: number): number {
  const lower = buf.toLowerCase();
  const n = options.length;
  for (let step = 1; step <= n; step++) {
    const i = (from + step) % n;
    const o = options[i];
    if (o && !o.disabled && o.label.toLowerCase().startsWith(lower)) return i;
  }
  // also check the current index (single-char repeat)
  const cur = options[from];
  if (cur && !cur.disabled && cur.label.toLowerCase().startsWith(lower)) return from;
  return from;
}

function useTypeAhead() {
  const bufRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (char: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    bufRef.current += char;
    timerRef.current = setTimeout(() => {
      bufRef.current = "";
    }, 500);
    return bufRef.current;
  };
}

/* ================================================================== */
/*  Select — single-select                                             */
/* ================================================================== */

export type SelectProps = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Renders an own <label>; omit when wrapping in <Field>. */
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  /** Mono variant for technical values. */
  mono?: boolean;
  id?: string;
  name?: string;
  className?: string;
  /** Injected when used inside <Field>. */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  label,
  helperText,
  error,
  required,
  mono = false,
  id,
  name,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
}: SelectProps) {
  const reactId = useId().replace(/:/g, "");
  const base = id ?? reactId;
  const labelId = `${base}-label`;
  const valueId = `${base}-value`;
  const listboxId = `${base}-listbox`;
  const helperId = `${base}-helper`;
  const errorId = `${base}-error`;
  const optionId = (i: number) => `${base}-opt-${i}`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(0, options.findIndex((o) => o.value === value)),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const pushType = useTypeAhead();

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;
  const hasError = !!error || ariaInvalid === true;

  const describedBy =
    [helperText ? helperId : null, error ? errorId : null, ariaDescribedBy ?? null]
      .filter(Boolean)
      .join(" ") || undefined;

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Keep the active option in view.
  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openMenu(toIndex?: number) {
    setActiveIndex(toIndex ?? (selectedIndex >= 0 ? selectedIndex : firstEnabled(options)));
    setOpen(true);
  }

  function commit(index: number) {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        open ? setActiveIndex((i) => nextEnabled(options, i, 1)) : openMenu();
        break;
      case "ArrowUp":
        e.preventDefault();
        open ? setActiveIndex((i) => nextEnabled(options, i, -1)) : openMenu(lastEnabled(options));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(firstEnabled(options));
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(lastEnabled(options));
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        open ? commit(activeIndex) : openMenu();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const buf = pushType(e.key);
          if (!open) setOpen(true);
          setActiveIndex((i) => typeAheadIndex(options, buf, i));
        }
    }
  }

  return (
    <FieldChrome
      labelId={labelId}
      label={label}
      required={required ?? ariaRequired}
      helperId={helperId}
      helperText={helperText}
      errorId={errorId}
      error={error}
      className={className}
    >
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={base}
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-activedescendant={open ? optionId(activeIndex) : undefined}
          aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          aria-required={(required ?? ariaRequired) || undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onKeyDown}
          className={triggerClass(open, hasError, mono)}
        >
          <span id={valueId} className={cn("truncate", selected ? "text-primary" : "text-faint")}>
            {selected ? selected.label : placeholder}
          </span>
          <Caret open={open} />
        </button>

        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            tabIndex={-1}
            className={PANEL_CLASS}
          >
            {options.map((o, i) => (
              <OptionRow
                key={o.value}
                id={optionId(i)}
                option={o}
                selected={o.value === value}
                active={i === activeIndex}
                mono={mono}
                onSelect={() => commit(i)}
                onActivate={() => setActiveIndex(i)}
                setRef={(el) => {
                  optionRefs.current[i] = el;
                }}
              />
            ))}
          </ul>
        )}

        {/* Hidden input so the control still posts in a native form submit. */}
        {name && <input type="hidden" name={name} value={value} />}
      </div>
    </FieldChrome>
  );
}

/* ================================================================== */
/*  MultiSelect — multi-select (built for future filters; not yet      */
/*  wired into a page — see /styleguide for the live demo).            */
/* ================================================================== */

export type MultiSelectProps = {
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  mono?: boolean;
  id?: string;
  name?: string;
  className?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
  label,
  helperText,
  error,
  required,
  mono = false,
  id,
  name,
  className,
}: MultiSelectProps) {
  const reactId = useId().replace(/:/g, "");
  const base = id ?? reactId;
  const labelId = `${base}-label`;
  const valueId = `${base}-value`;
  const listboxId = `${base}-listbox`;
  const helperId = `${base}-helper`;
  const errorId = `${base}-error`;
  const optionId = (i: number) => `${base}-opt-${i}`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() => firstEnabled(options));
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const pushType = useTypeAhead();

  const hasError = !!error;
  const selectedSet = new Set(value);

  const describedBy =
    [helperText ? helperId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const summary =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? options
            .filter((o) => selectedSet.has(o.value))
            .map((o) => o.label)
            .join(", ")
        : `${value.length} selected`;

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function toggle(index: number) {
    const opt = options[index];
    if (!opt || opt.disabled) return;
    const next = new Set(value);
    if (next.has(opt.value)) next.delete(opt.value);
    else next.add(opt.value);
    // Preserve option order in the emitted array.
    onChange(options.filter((o) => next.has(o.value)).map((o) => o.value));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        open ? setActiveIndex((i) => nextEnabled(options, i, 1)) : setOpen(true);
        break;
      case "ArrowUp":
        e.preventDefault();
        open ? setActiveIndex((i) => nextEnabled(options, i, -1)) : setOpen(true);
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(firstEnabled(options));
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(lastEnabled(options));
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        open ? toggle(activeIndex) : setOpen(true);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          const buf = pushType(e.key);
          if (!open) setOpen(true);
          setActiveIndex((i) => typeAheadIndex(options, buf, i));
        }
    }
  }

  return (
    <FieldChrome
      labelId={labelId}
      label={label}
      required={required}
      helperId={helperId}
      helperText={helperText}
      errorId={errorId}
      error={error}
      className={className}
    >
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={base}
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-expanded={open}
          aria-activedescendant={open ? optionId(activeIndex) : undefined}
          aria-labelledby={label ? `${labelId} ${valueId}` : undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onKeyDown}
          className={triggerClass(open, hasError, mono)}
        >
          <span id={valueId} className={cn("truncate", value.length ? "text-primary" : "text-faint")}>
            {summary}
          </span>
          <Caret open={open} />
        </button>

        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-labelledby={label ? labelId : undefined}
            tabIndex={-1}
            className={PANEL_CLASS}
          >
            {options.map((o, i) => (
              <OptionRow
                key={o.value}
                id={optionId(i)}
                option={o}
                selected={selectedSet.has(o.value)}
                active={i === activeIndex}
                mono={mono}
                onSelect={() => toggle(i)}
                onActivate={() => setActiveIndex(i)}
                setRef={(el) => {
                  optionRefs.current[i] = el;
                }}
              />
            ))}
          </ul>
        )}

        {name && value.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      </div>
    </FieldChrome>
  );
}

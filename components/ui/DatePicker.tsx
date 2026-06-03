"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format, isValid, parse } from "date-fns";
import { cn } from "@/lib/cn";

/**
 * DatePicker — themed replacement for the browser's native <input type="date"> (whose
 * calendar popup can't be styled). Renders an on-theme trigger + a react-day-picker
 * calendar in a control-room popover. Value is a "yyyy-MM-dd" string (drop-in for the old
 * date inputs); emits the same.
 */
function parseValue(v: string): Date | undefined {
  if (!v) return undefined;
  const d = parse(v, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date…",
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = parseValue(value);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border-strong bg-surface-1 px-3.5 text-left text-sm transition-colors hover:border-grey-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={cn(selected ? "text-primary" : "text-faint")}>
          {selected ? format(selected, "d MMM yyyy") : placeholder}
        </span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-faint" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v3M16 3v3" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-full z-50 mt-1 rounded-md border border-border-strong bg-surface-1 p-2 shadow-elev-3"
        >
          <DayPicker
            className="pb-daypicker"
            mode="single"
            weekStartsOn={1}
            showOutsideDays
            defaultMonth={selected}
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(format(d, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
          />
          <div className="flex items-center justify-between border-t border-border-subtle px-1 pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-secondary transition-colors hover:text-primary"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(format(new Date(), "yyyy-MM-dd"));
                setOpen(false);
              }}
              className="font-medium text-accent hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

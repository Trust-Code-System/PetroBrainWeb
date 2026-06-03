"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon } from "@/components/app/icons";
import { FRAMEWORKS } from "@/lib/emissions/labels";
import type { ReportFramework } from "@/lib/emissions/types";

/**
 * ReportMenu — the multi-framework report button. Opens a menu of frameworks (NUPRC
 * GHGEMP / OGMP 2.0 / CSRD / ISO 14064); choosing one calls the report generator.
 */
export function ReportMenu({
  onGenerate,
  disabled,
}: {
  onGenerate: (framework: ReportFramework) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-1 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generate report
        <ChevronDownIcon className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Report framework"
          className="absolute right-0 top-full z-30 mt-2 w-56 rounded-md border border-border-subtle bg-surface-1 p-1.5 shadow-elev-3"
        >
          <p className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-faint">
            Framework
          </p>
          {FRAMEWORKS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onGenerate(f.value);
              }}
              className="block w-full rounded-sm px-3 py-2 text-left text-sm text-secondary transition-colors hover:bg-surface-2 hover:text-primary"
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

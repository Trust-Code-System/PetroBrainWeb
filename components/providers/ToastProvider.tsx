"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { CloseIcon } from "@/components/app/icons";

/**
 * ToastProvider — lightweight toasts with an optional Undo action. Used to confirm copilot
 * writes ("Copilot created EM-1042" + Undo). Bottom-left so it doesn't collide with the
 * copilot bubble (bottom-right). Auto-dismisses; undoable toasts linger longer.
 */

type Tone = "default" | "success" | "danger";

export interface ToastInput {
  message: string;
  tone?: Tone;
  undo?: () => void;
}

interface Toast extends ToastInput {
  id: string;
}

interface ToastContextValue {
  show: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastSeq = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (toast: ToastInput) => {
      const id = `t${Date.now()}_${toastSeq++}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      const ttl = toast.undo ? 12_000 : 6_000;
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ttl),
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 left-5 z-[60] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-center gap-3 rounded-md border bg-surface-1 px-3.5 py-3 shadow-elev-3",
              t.tone === "success" && "border-safe/40",
              t.tone === "danger" && "border-danger/40",
              (!t.tone || t.tone === "default") && "border-border-strong",
            )}
          >
            <p className="min-w-0 flex-1 text-sm text-primary">{t.message}</p>
            {t.undo && (
              <button
                type="button"
                onClick={() => {
                  t.undo?.();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded-sm px-2 py-1 text-sm font-medium text-accent hover:bg-surface-2"
              >
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="shrink-0 text-secondary hover:text-primary"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

"use client";

import { useCallback, useEffect, useState } from "react";

export type RsvpToastItem = {
  id: string;
  title?: string;
  message: string;
  variant?: "default" | "seating" | "declined";
};

export type RsvpToastInput =
  | string
  | {
      title?: string;
      message: string;
      variant?: RsvpToastItem["variant"];
    };

const TOAST_DURATION_MS = 4500;

function normalizeToastInput(input: RsvpToastInput): Omit<RsvpToastItem, "id"> {
  if (typeof input === "string") {
    const isDeclined = input.toLowerCase().includes("declined");
    return {
      message: input,
      variant: isDeclined ? "declined" : "default",
    };
  }

  return {
    title: input.title,
    message: input.message,
    variant: input.variant ?? "default",
  };
}

export function useRsvpToasts() {
  const [toasts, setToasts] = useState<RsvpToastItem[]>([]);

  const showToast = useCallback((input: RsvpToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, ...normalizeToastInput(input) }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

export function RsvpToastStack({
  toasts,
  onDismiss,
  position = "bottom-right",
}: {
  toasts: RsvpToastItem[];
  onDismiss: (id: string) => void;
  position?: "top-right" | "bottom-right";
}) {
  const positionClass =
    position === "top-right"
      ? "top-4 right-4"
      : "bottom-4 right-4";

  return (
    <div
      className={`pointer-events-none fixed ${positionClass} z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0`}
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <RsvpToast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function RsvpToast({
  toast,
  onDismiss,
}: {
  toast: RsvpToastItem;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = window.requestAnimationFrame(() => setVisible(true));

    const exitTimer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => onDismiss(toast.id), 200);
    }, TOAST_DURATION_MS);

    return () => {
      window.cancelAnimationFrame(enterTimer);
      window.clearTimeout(exitTimer);
    };
  }, [onDismiss, toast.id]);

  const variant = toast.variant ?? "default";

  const styles = {
    seating: {
      border: "border-amber-500/30",
      bg: "bg-zinc-900/95",
      dot: "bg-amber-400",
      title: "text-zinc-100",
      message: "text-zinc-400",
    },
    declined: {
      border: "border-red-900/50",
      bg: "bg-red-950/90",
      dot: "bg-red-400",
      title: "text-red-100",
      message: "text-red-200/80",
    },
    default: {
      border: "border-emerald-900/50",
      bg: "bg-emerald-950/90",
      dot: "bg-emerald-400",
      title: "text-emerald-100",
      message: "text-emerald-100",
    },
  }[variant];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-200 ease-out ${styles.border} ${styles.bg} ${
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-3 opacity-0"
      }`}
      role="status"
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className={`text-sm font-semibold leading-snug ${styles.title}`}>
            {toast.title}
          </p>
        )}
        <p
          className={`text-sm leading-snug ${toast.title ? "mt-0.5" : ""} ${styles.message}`}
        >
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md px-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

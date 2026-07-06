"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import {
  MAX_TABLE_CAPACITY,
  MAX_TABLE_SIZE,
  MIN_TABLE_CAPACITY,
  MIN_TABLE_SIZE,
  shapeLabel,
  type LayoutTable,
} from "@/lib/seating-layout";

import { deleteTableAction, updateTableSettingsAction } from "../actions";
import {
  seatingBtnDanger,
  seatingInput,
  seatingLabel,
  seatingPanel,
  seatingPanelHeader,
  seatingPanelSubtext,
} from "./seating-ui";

type TableSettingsPanelProps = {
  table: LayoutTable | null;
  onUpdate: (tableId: string, patch: Partial<LayoutTable>) => void;
  onDelete: (tableId: string) => void;
  onError: (message: string) => void;
  onClearSelection: () => void;
  onSaveStateChange?: (status: "idle" | "saving" | "saved") => void;
  variant?: "panel" | "embedded";
};

export function TableSettingsPanel({
  table,
  onUpdate,
  onDelete,
  onError,
  onClearSelection,
  onSaveStateChange,
  variant = "panel",
}: TableSettingsPanelProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [rotation, setRotation] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [isDeleting, startDeleteTransition] = useTransition();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTableRef = useRef<LayoutTable | null>(null);

  useEffect(() => {
    if (!table) {
      return;
    }

    setName(table.name);
    setCapacity(String(table.capacity));
    setWidth(String(table.width));
    setHeight(String(table.height));
    setRotation(String(table.rotation));
    setSaveState("idle");
    latestTableRef.current = table;
  }, [table?.id]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    onSaveStateChange?.(saveState);
  }, [saveState, onSaveStateChange]);

  if (!table) {
    if (variant === "embedded") {
      return null;
    }

    return (
      <aside
        className={`flex w-full shrink-0 flex-col items-center justify-center gap-3 border-dashed py-10 text-center lg:w-64 xl:w-72 ${seatingPanel}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/80 text-zinc-500">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-400">No table selected</p>
          <p className={`mt-1 max-w-[200px] ${seatingPanelSubtext}`}>
            Click a table on the canvas to edit its name, capacity, and layout.
          </p>
        </div>
      </aside>
    );
  }

  function scheduleSave(next: LayoutTable) {
    latestTableRef.current = next;
    setSaveState("saving");

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      const payload = latestTableRef.current;
      if (!payload) {
        return;
      }

      const result = await updateTableSettingsAction(payload.id, {
        name: payload.name.trim(),
        capacity: payload.capacity,
        width: payload.width,
        height: payload.height,
        rotation: payload.rotation,
      });

      if (result.error) {
        onError(result.error);
        setSaveState("idle");
        return;
      }

      setSaveState("saved");
    }, 400);
  }

  function applyPatch(patch: Partial<LayoutTable>) {
    const parsedCapacity = patch.capacity ?? table!.capacity;
    const parsedWidth = patch.width ?? table!.width;
    const parsedHeight = patch.height ?? table!.height;
    const parsedRotation = patch.rotation ?? table!.rotation;

    const next: LayoutTable = {
      ...table!,
      ...patch,
      name: patch.name ?? table!.name,
      capacity: parsedCapacity,
      width: parsedWidth,
      height: parsedHeight,
      rotation: parsedRotation,
    };

    onUpdate(table!.id, patch);
    scheduleSave(next);
  }

  function handleDelete() {
    if (!table) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${table.name}"? Guests assigned to this table will become unassigned.`,
    );

    if (!confirmed) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteTableAction(table.id);

      if (result.error) {
        onError(result.error);
        return;
      }

      onDelete(table.id);
      onClearSelection();
    });
  }

  return (
    <div className={variant === "panel" ? `w-full shrink-0 lg:w-64 xl:w-72 ${seatingPanel}` : ""}>
      {variant === "panel" && (
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="min-w-0">
            <h4 className={seatingPanelHeader}>Table settings</h4>
            <p className={`mt-0.5 truncate ${seatingPanelSubtext}`}>
              {table.name} · {shapeLabel(table.shape)}
            </p>
          </div>
          <span
            className={`shrink-0 text-[10px] font-medium uppercase tracking-wide transition-opacity ${
              saveState === "idle" ? "opacity-0" : "text-amber-400/80"
            }`}
            aria-live="polite"
          >
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved"
                : ""}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={seatingLabel}>Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              applyPatch({ name: event.target.value });
            }}
            className={seatingInput}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={seatingLabel}>Capacity</span>
          <input
            type="number"
            min={MIN_TABLE_CAPACITY}
            max={MAX_TABLE_CAPACITY}
            value={capacity}
            onChange={(event) => {
              setCapacity(event.target.value);
              const parsed = Number(event.target.value);
              if (
                Number.isInteger(parsed) &&
                parsed >= MIN_TABLE_CAPACITY &&
                parsed <= MAX_TABLE_CAPACITY
              ) {
                applyPatch({ capacity: parsed });
              }
            }}
            className={seatingInput}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={seatingLabel}>Width</span>
            <input
              type="number"
              min={MIN_TABLE_SIZE}
              max={MAX_TABLE_SIZE}
              value={width}
              onChange={(event) => {
                setWidth(event.target.value);
                const parsed = Number(event.target.value);
                if (
                  Number.isFinite(parsed) &&
                  parsed >= MIN_TABLE_SIZE &&
                  parsed <= MAX_TABLE_SIZE
                ) {
                  applyPatch({ width: parsed });
                }
              }}
              className={seatingInput}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={seatingLabel}>Height</span>
            <input
              type="number"
              min={MIN_TABLE_SIZE}
              max={MAX_TABLE_SIZE}
              value={height}
              onChange={(event) => {
                setHeight(event.target.value);
                const parsed = Number(event.target.value);
                if (
                  Number.isFinite(parsed) &&
                  parsed >= MIN_TABLE_SIZE &&
                  parsed <= MAX_TABLE_SIZE
                ) {
                  applyPatch({ height: parsed });
                }
              }}
              className={seatingInput}
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={seatingLabel}>Rotation (°)</span>
          <input
            type="number"
            value={rotation}
            onChange={(event) => {
              setRotation(event.target.value);
              const parsed = Number(event.target.value);
              if (Number.isFinite(parsed)) {
                applyPatch({ rotation: parsed });
              }
            }}
            className={seatingInput}
          />
        </label>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className={seatingBtnDanger}
        >
          {isDeleting ? "Deleting…" : "Delete table"}
        </button>
      </div>
    </div>
  );
}

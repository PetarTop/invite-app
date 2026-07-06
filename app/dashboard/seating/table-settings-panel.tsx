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

type TableSettingsPanelProps = {
  table: LayoutTable | null;
  onUpdate: (tableId: string, patch: Partial<LayoutTable>) => void;
  onDelete: (tableId: string) => void;
  onError: (message: string) => void;
  onClearSelection: () => void;
};

export function TableSettingsPanel({
  table,
  onUpdate,
  onDelete,
  onError,
  onClearSelection,
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

  if (!table) {
    return (
      <aside className="w-full shrink-0 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 lg:w-64">
        Click a table on the canvas to edit its settings.
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
    <aside className="w-full shrink-0 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:w-64">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Table settings
          </h4>
          <p className="text-xs text-zinc-500">{shapeLabel(table.shape)}</p>
        </div>
        <span className="text-xs text-zinc-400">
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved"
              : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              applyPatch({ name: event.target.value });
            }}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Capacity
          </span>
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Width
          </span>
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Height
          </span>
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Rotation (°)
          </span>
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60 dark:border-red-900 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900"
        >
          {isDeleting ? "Deleting..." : "Delete table"}
        </button>
      </div>
    </aside>
  );
}

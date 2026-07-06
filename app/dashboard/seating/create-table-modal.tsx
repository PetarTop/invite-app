"use client";

import { useEffect, useState, useTransition } from "react";

import {
  DEFAULT_TABLE_CAPACITY,
  MAX_TABLE_CAPACITY,
  MIN_TABLE_CAPACITY,
  shapeLabel,
  type TableShape,
} from "@/lib/seating-layout";

import { createLayoutTable } from "../actions";

type CreateTableModalProps = {
  eventId: string;
  shape: TableShape;
  defaultName: string;
  onClose: () => void;
  onError: (message: string) => void;
};

export function CreateTableModal({
  eventId,
  shape,
  defaultName,
  onClose,
  onError,
}: CreateTableModalProps) {
  const [name, setName] = useState(defaultName);
  const [capacity, setCapacity] = useState(String(DEFAULT_TABLE_CAPACITY));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(defaultName);
    setCapacity(String(DEFAULT_TABLE_CAPACITY));
  }, [defaultName, shape]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    const trimmedName = name.trim();
    const parsedCapacity = Number(capacity);

    if (!trimmedName) {
      onError("Table name is required.");
      return;
    }

    if (
      !Number.isInteger(parsedCapacity) ||
      parsedCapacity < MIN_TABLE_CAPACITY ||
      parsedCapacity > MAX_TABLE_CAPACITY
    ) {
      onError(
        `Capacity must be between ${MIN_TABLE_CAPACITY} and ${MAX_TABLE_CAPACITY}.`,
      );
      return;
    }

    startTransition(async () => {
      const result = await createLayoutTable(eventId, {
        shape,
        name: trimmedName,
        capacity: parsedCapacity,
      });

      if (result.error) {
        onError(result.error);
        return;
      }

      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-table-title"
      >
        <h3
          id="create-table-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Add {shapeLabel(shape).toLowerCase()} table
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Shape: {shapeLabel(shape)}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-table-name"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Table name
            </label>
            <input
              id="create-table-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoFocus
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="create-table-capacity"
              className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              Capacity
            </label>
            <input
              id="create-table-capacity"
              type="number"
              min={MIN_TABLE_CAPACITY}
              max={MAX_TABLE_CAPACITY}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              required
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isPending ? "Creating..." : "Create table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

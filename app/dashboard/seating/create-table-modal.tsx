"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  DEFAULT_TABLE_CAPACITY,
  MAX_TABLE_CAPACITY,
  MIN_TABLE_CAPACITY,
  shapeLabel,
  type TableShape,
} from "@/lib/seating-layout";

const SHAPE_OPTIONS: TableShape[] = ["round", "rectangle", "square"];

import { createLayoutTable } from "../actions";
import {
  seatingBtnPrimary,
  seatingBtnSecondary,
  seatingInput,
  seatingLabel,
  seatingPanelSubtext,
} from "./seating-ui";

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
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [selectedShape, setSelectedShape] = useState<TableShape>(shape);
  const [capacity, setCapacity] = useState(String(DEFAULT_TABLE_CAPACITY));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setName(defaultName);
    setSelectedShape(shape);
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
        shape: selectedShape,
        name: trimmedName,
        capacity: parsedCapacity,
      });

      if (result.error) {
        onError(result.error);
        return;
      }

      router.refresh();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-800/90 bg-zinc-900 p-6 shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-table-title"
      >
        <h3
          id="create-table-title"
          className="text-lg font-semibold tracking-tight text-zinc-100"
        >
          Add table
        </h3>
        <p className={`mt-1 ${seatingPanelSubtext}`}>
          Configure the new table for your floor plan.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-table-name" className={seatingLabel}>
              Table name
            </label>
            <input
              id="create-table-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoFocus
              className={seatingInput}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-table-shape" className={seatingLabel}>
              Shape
            </label>
            <select
              id="create-table-shape"
              value={selectedShape}
              onChange={(event) =>
                setSelectedShape(event.target.value as TableShape)
              }
              className={seatingInput}
            >
              {SHAPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {shapeLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-table-capacity" className={seatingLabel}>
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
              className={seatingInput}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className={seatingBtnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={seatingBtnPrimary}
            >
              {isPending ? "Creating…" : "Create table"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useState, useTransition } from "react";

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  clampTablePosition,
  parseLayoutTableDragId,
  type LayoutTable,
  type TableShape,
} from "@/lib/seating-layout";

import { createLayoutTable, updateTablePositionAction } from "../actions";
import { CanvasTable, StaticCanvasTable } from "./canvas-table";

type SeatingPlanEditorProps = {
  eventId: string;
  tables: LayoutTable[];
};

function CanvasOverlayTable({ table }: { table: LayoutTable }) {
  const borderRadius =
    table.shape === "round" ? "9999px" : table.shape === "square" ? "12px" : "10px";

  return (
    <div
      style={{
        width: table.width,
        height: table.height,
      }}
    >
      <div
        className="flex h-full w-full cursor-grabbing flex-col items-center justify-center border-2 border-zinc-400 bg-white px-2 text-center shadow-lg ring-2 ring-zinc-300 dark:border-zinc-500 dark:bg-zinc-950 dark:ring-zinc-600"
        style={{
          borderRadius,
          transform: `rotate(${table.rotation}deg)`,
        }}
      >
        <span className="truncate text-xs font-semibold">{table.name}</span>
        <span className="text-[10px] text-zinc-500">{table.capacity} seats</span>
      </div>
    </div>
  );
}

function SeatingCanvas({
  eventId,
  tables,
  activeTableId,
}: {
  eventId: string;
  tables: LayoutTable[];
  activeTableId: string | null;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:40px_40px] dark:border-zinc-800 dark:bg-zinc-950 dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: "100%" }}
    >
      {tables.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-zinc-500">
          No tables yet. Add a round, rectangular, or square table to begin.
        </div>
      ) : (
        tables.map((table) => (
          <CanvasTable
            key={table.id}
            table={table}
            eventId={eventId}
            isDragging={activeTableId === table.id}
          />
        ))
      )}
    </div>
  );
}

function StaticSeatingCanvas({ tables }: { tables: LayoutTable[] }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:40px_40px] dark:border-zinc-800 dark:bg-zinc-950"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: "100%" }}
    >
      {tables.map((table) => (
        <StaticCanvasTable key={table.id} table={table} />
      ))}
    </div>
  );
}

const ADD_BUTTONS: { shape: TableShape; label: string }[] = [
  { shape: "round", label: "Add round table" },
  { shape: "rectangle", label: "Add rectangular table" },
  { shape: "square", label: "Add square table" },
];

export function SeatingPlanEditor({
  eventId,
  tables: initialTables,
}: SeatingPlanEditorProps) {
  const [tables, setTables] = useState(initialTables);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isAdding, startAddTransition] = useTransition();
  const [, startMoveTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const activeTable =
    tables.find((table) => table.id === activeTableId) ?? null;

  function handleAddTable(shape: TableShape) {
    setError(null);

    startAddTransition(async () => {
      const result = await createLayoutTable(eventId, shape);

      if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setError(null);
    setActiveTableId(parseLayoutTableDragId(String(event.active.id)));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTableId(null);

    const { active, delta } = event;
    if (!delta.x && !delta.y) {
      return;
    }

    const tableId = parseLayoutTableDragId(String(active.id));
    const table = tables.find((item) => item.id === tableId);
    if (!table) {
      return;
    }

    const nextPosition = clampTablePosition(
      table.x + delta.x,
      table.y + delta.y,
      table.width,
      table.height,
    );

    if (nextPosition.x === table.x && nextPosition.y === table.y) {
      return;
    }

    const previousTables = tables;
    setTables((current) =>
      current.map((item) =>
        item.id === tableId
          ? { ...item, x: nextPosition.x, y: nextPosition.y }
          : item,
      ),
    );

    startMoveTransition(async () => {
      const result = await updateTablePositionAction(
        tableId,
        nextPosition.x,
        nextPosition.y,
      );

      if (result.error) {
        setTables(previousTables);
        setError(result.error);
      }
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Seating plan
          </h4>
          <p className="text-xs text-zinc-500">
            Drag tables to arrange your layout. Guest assignment is below.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ADD_BUTTONS.map(({ shape, label }) => (
            <button
              key={shape}
              type="button"
              disabled={isAdding}
              onClick={() => handleAddTable(shape)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {isAdding ? "Adding..." : label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto">
        {!isMounted ? (
          <StaticSeatingCanvas tables={tables} />
        ) : (
          <DndContext
            id={`seating-plan-${eventId}`}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SeatingCanvas
              eventId={eventId}
              tables={tables}
              activeTableId={activeTableId}
            />

            <DragOverlay>
              {activeTable ? <CanvasOverlayTable table={activeTable} /> : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </section>
  );
}

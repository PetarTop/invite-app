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
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  clampTablePosition,
  parseLayoutTableDragId,
  type LayoutTable,
  type TableShape,
} from "@/lib/seating-layout";

import { updateTablePositionAction } from "../actions";
import { CanvasTable, OverlayCanvasTable, StaticCanvasTable } from "./canvas-table";
import { CreateTableModal } from "./create-table-modal";
import { TableSettingsPanel } from "./table-settings-panel";

type SeatingPlanEditorProps = {
  eventId: string;
  tables: LayoutTable[];
};

const ADD_BUTTONS: { shape: TableShape; label: string }[] = [
  { shape: "round", label: "Add round table" },
  { shape: "rectangle", label: "Add rectangular table" },
  { shape: "square", label: "Add square table" },
];

function SeatingCanvas({
  eventId,
  tables,
  draggingTableId,
  selectedTableId,
  onDeselect,
  onSelectTable,
}: {
  eventId: string;
  tables: LayoutTable[];
  draggingTableId: string | null;
  selectedTableId: string | null;
  onDeselect: () => void;
  onSelectTable: (tableId: string) => void;
}) {
  return (
    <div
      className="relative overflow-visible rounded-xl border border-zinc-200 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:40px_40px] dark:border-zinc-800 dark:bg-zinc-950 dark:bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: "100%" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onDeselect();
        }
      }}
      role="presentation"
    >
      {tables.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-zinc-500">
          No tables yet. Add a round, rectangular, or square table to begin.
        </div>
      ) : (
        tables.map((table) => (
          <CanvasTable
            key={table.id}
            table={table}
            eventId={eventId}
            isDragging={draggingTableId === table.id}
            isSelected={selectedTableId === table.id}
            onSelect={() => onSelectTable(table.id)}
          />
        ))
      )}
    </div>
  );
}

function StaticSeatingCanvas({ tables }: { tables: LayoutTable[] }) {
  return (
    <div
      className="relative overflow-visible rounded-xl border border-zinc-200 bg-[linear-gradient(to_right,#f4f4f5_1px,transparent_1px),linear-gradient(to_bottom,#f4f4f5_1px,transparent_1px)] bg-[size:40px_40px] dark:border-zinc-800 dark:bg-zinc-950"
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: "100%" }}
    >
      {tables.map((table) => (
        <StaticCanvasTable key={table.id} table={table} />
      ))}
    </div>
  );
}

export function SeatingPlanEditor({
  eventId,
  tables: initialTables,
}: SeatingPlanEditorProps) {
  const [tables, setTables] = useState(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [createShape, setCreateShape] = useState<TableShape | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [, startMoveTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setTables(initialTables);
    setSelectedTableId((current) => {
      if (current && !initialTables.some((table) => table.id === current)) {
        return null;
      }
      return current;
    });
  }, [initialTables]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const draggingTable =
    tables.find((table) => table.id === draggingTableId) ?? null;

  const defaultTableName = `Table ${tables.length + 1}`;

  function handleTableUpdate(tableId: string, patch: Partial<LayoutTable>) {
    setTables((current) =>
      current.map((table) =>
        table.id === tableId ? { ...table, ...patch } : table,
      ),
    );
  }

  function handleTableDelete(tableId: string) {
    setTables((current) => current.filter((table) => table.id !== tableId));
  }

  function handleDragStart(event: DragStartEvent) {
    setError(null);
    const tableId = parseLayoutTableDragId(String(event.active.id));
    setDraggingTableId(tableId);
    setSelectedTableId(tableId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const tableId = parseLayoutTableDragId(String(event.active.id));
    setDraggingTableId(null);

    const { delta } = event;
    if (!delta.x && !delta.y) {
      return;
    }

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

  function handleCanvasClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      setSelectedTableId(null);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Seating plan
          </h4>
          <p className="text-xs text-zinc-500">
            Click a table to edit it. Drag to move. Guest assignment is below.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ADD_BUTTONS.map(({ shape, label }) => (
            <button
              key={shape}
              type="button"
              onClick={() => {
                setError(null);
                setCreateShape(shape);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 overflow-x-auto">
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
                draggingTableId={draggingTableId}
                selectedTableId={selectedTableId}
                onDeselect={() => setSelectedTableId(null)}
                onSelectTable={setSelectedTableId}
              />

              <DragOverlay>
                {draggingTable ? (
                  <OverlayCanvasTable table={draggingTable} />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <TableSettingsPanel
          table={selectedTable}
          onUpdate={handleTableUpdate}
          onDelete={handleTableDelete}
          onError={setError}
          onClearSelection={() => setSelectedTableId(null)}
        />
      </div>

      {createShape && (
        <CreateTableModal
          eventId={eventId}
          shape={createShape}
          defaultName={defaultTableName}
          onClose={() => setCreateShape(null)}
          onError={setError}
        />
      )}
    </section>
  );
}

"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  activeChairIdFromOver,
  chairDropId,
  isGuestDragId,
  isLayoutTableDragId,
  parseChairDropData,
  parseGuestDragId,
  unassignedZoneId,
} from "@/lib/seating-dnd";
import { seatingCollisionDetection } from "@/lib/seating-collision";
import { logSeatDnd, parseDropTarget, SEAT_DND_DEBUG } from "@/lib/seating-dnd-debug";
import {
  buildGuestsBySeat,
  isGuestUnassignedForCanvas,
  type GoingGuest,
} from "@/lib/seating-guests";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  clampTablePosition,
  parseLayoutTableDragId,
  type LayoutTable,
  type TableShape,
} from "@/lib/seating-layout";

import {
  assignGuestToSeatAction,
  updateTablePositionAction,
} from "../actions";
import { CanvasTable, OverlayCanvasTable, StaticCanvasTable } from "./canvas-table";
import { CreateTableModal } from "./create-table-modal";
import { GuestDragOverlay, GuestListPanel } from "./guest-list-panel";
import {
  seatingBtnPrimary,
  seatingBtnSecondary,
  seatingCanvas,
  seatingCanvasEmpty,
  seatingPanel,
  seatingPanelHeader,
  seatingPanelSubtext,
} from "./seating-ui";
import { TableSettingsPanel } from "./table-settings-panel";

type SeatingPlanEditorProps = {
  eventId: string;
  tables: LayoutTable[];
  guests: GoingGuest[];
  onGuestsChange: (guests: GoingGuest[]) => void;
};

const ADD_BUTTONS: {
  shape: TableShape;
  label: string;
  shortLabel: string;
}[] = [
  { shape: "round", label: "Round table", shortLabel: "Round" },
  { shape: "rectangle", label: "Rectangular table", shortLabel: "Rectangle" },
  { shape: "square", label: "Square table", shortLabel: "Square" },
];

function SeatingCanvas({
  eventId,
  tables,
  guestsBySeat,
  draggingTableId,
  selectedTableId,
  onDeselect,
  onSelectTable,
  onUnassignGuest,
  activeChairId,
}: {
  eventId: string;
  tables: LayoutTable[];
  guestsBySeat: Map<string, GoingGuest>;
  draggingTableId: string | null;
  selectedTableId: string | null;
  onDeselect: () => void;
  onSelectTable: (tableId: string) => void;
  onUnassignGuest: (guestId: string) => void;
  activeChairId: string | null;
}) {
  return (
    <div
      className={seatingCanvas}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: "100%" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onDeselect();
        }
      }}
      role="presentation"
    >
      {tables.length === 0 ? (
        <div className={seatingCanvasEmpty}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-600">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-400">Your floor plan is empty</p>
          <p className="max-w-xs text-xs leading-relaxed text-zinc-600">
            Add a table above to start arranging seats for your event.
          </p>
        </div>
      ) : (
        tables.map((table) => (
          <CanvasTable
            key={table.id}
            table={table}
            eventId={eventId}
            guestsBySeat={guestsBySeat}
            isDragging={draggingTableId === table.id}
            isSelected={selectedTableId === table.id}
            onSelect={() => onSelectTable(table.id)}
            onUnassignGuest={onUnassignGuest}
            activeChairId={activeChairId}
          />
        ))
      )}
    </div>
  );
}

function StaticGuestList({ guests }: { guests: GoingGuest[] }) {
  return (
    <aside className={`w-full shrink-0 lg:w-56 xl:w-60 ${seatingPanel}`}>
      <h4 className={seatingPanelHeader}>Guests</h4>
      <div className="mt-3 flex min-h-36 flex-col gap-2 rounded-xl border border-dashed border-zinc-700/60 bg-zinc-950/40 p-2.5">
        {guests.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-zinc-500">
            Everyone is seated.
          </p>
        ) : (
          guests.map((guest) => (
            <div
              key={guest.id}
              className="rounded-lg border border-zinc-700/70 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100"
            >
              {guest.name}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function StaticSeatingCanvas({
  eventId,
  tables,
  guestsBySeat,
}: {
  eventId: string;
  tables: LayoutTable[];
  guestsBySeat: Map<string, GoingGuest>;
}) {
  return (
    <div
      className={seatingCanvas}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, maxWidth: "100%" }}
    >
      {tables.map((table) => (
        <StaticCanvasTable
          key={table.id}
          table={table}
          eventId={eventId}
          guestsBySeat={guestsBySeat}
        />
      ))}
    </div>
  );
}

export function SeatingPlanEditor({
  eventId,
  tables: initialTables,
  guests,
  onGuestsChange,
}: SeatingPlanEditorProps) {
  const [tables, setTables] = useState(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [activeChairId, setActiveChairId] = useState<string | null>(null);
  const [createShape, setCreateShape] = useState<TableShape | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [, startMoveTransition] = useTransition();
  const [, startGuestTransition] = useTransition();

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

  useEffect(() => {
    if (!SEAT_DND_DEBUG) {
      return;
    }

    const registeredChairs = tables.flatMap((table) =>
      Array.from({ length: table.capacity }, (_, seatIndex) => ({
        dropId: chairDropId(table.id, seatIndex),
        tableName: table.name,
        tableId: table.id,
        seatIndex,
      })),
    );

    logSeatDnd("init:expected-droppables", {
      eventId,
      tableCount: tables.length,
      chairDroppableCount: registeredChairs.length,
      chairs: registeredChairs,
    });
  }, [eventId, tables]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const guestsBySeat = useMemo(() => buildGuestsBySeat(guests), [guests]);

  const unassignedGuests = useMemo(
    () => guests.filter(isGuestUnassignedForCanvas),
    [guests],
  );

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const draggingTable =
    tables.find((table) => table.id === draggingTableId) ?? null;

  const activeGuest =
    guests.find((guest) => guest.id === activeGuestId) ?? null;

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
    onGuestsChange(
      guests.map((guest) =>
        guest.table_id === tableId
          ? { ...guest, table_id: null, seat_index: null }
          : guest,
      ),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setError(null);
    const id = String(event.active.id);

    logSeatDnd("dragStart", {
      activeId: id,
      activeData: event.active.data.current,
    });

    if (isLayoutTableDragId(id)) {
      const tableId = parseLayoutTableDragId(id);
      setDraggingTableId(tableId);
      setSelectedTableId(tableId);
      setActiveGuestId(null);
      return;
    }

    if (isGuestDragId(id)) {
      setActiveGuestId(parseGuestDragId(id));
      setDraggingTableId(null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    setActiveChairId(activeChairIdFromOver(event.over));

    if (!isGuestDragId(String(event.active.id))) {
      return;
    }

    const overId = event.over ? String(event.over.id) : null;

    logSeatDnd("dragOver", {
      activeId: String(event.active.id),
      overId,
      overData: event.over?.data.current ?? null,
      parsedTarget: parseDropTarget(overId),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveChairId(null);
    const id = String(event.active.id);

    if (isLayoutTableDragId(id)) {
      handleTableDragEnd(event);
      return;
    }

    if (isGuestDragId(id)) {
      handleGuestDragEnd(event);
    }
  }

  function handleTableDragEnd(event: DragEndEvent) {
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

  function handleGuestDragEnd(event: DragEndEvent) {
    setActiveGuestId(null);

    const { active, over } = event;
    const overId = over ? String(over.id) : null;
    const parsedTarget = parseDropTarget(overId);

    logSeatDnd("dragEnd", {
      activeId: String(active.id),
      activeData: active.data.current,
      overId,
      overData: over?.data.current ?? null,
      parsedTarget,
    });

    if (!over) {
      logSeatDnd("dragEnd:failed", {
        reason: "no droppable target (over is null)",
        hint: "Pointer may be over a non-droppable layer (table surface, another table, or gap between chairs)",
      });
      return;
    }

    const guestId = parseGuestDragId(String(active.id));
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) {
      logSeatDnd("dragEnd:failed", { reason: "guest not found", guestId });
      return;
    }

    const previousGuests = guests;

    if (overId === unassignedZoneId(eventId)) {
      if (guest.seat_index === null && guest.table_id === null) {
        return;
      }

      onGuestsChange(
        guests.map((item) =>
          item.id === guestId
            ? { ...item, table_id: null, seat_index: null }
            : item,
        ),
      );

      startGuestTransition(async () => {
        const result = await assignGuestToSeatAction(guestId, null, null);
        if (result.error) {
          onGuestsChange(previousGuests);
          setError(result.error);
        }
      });
      return;
    }

    const chair = parseChairDropData(over.data.current);

    if (!chair) {
      logSeatDnd("dragEnd:failed", {
        reason: "over is not a chair droppable",
        overId,
        overData: over.data.current ?? null,
        parsedTarget,
        hint:
          parsedTarget.kind === "guest-draggable"
            ? "Dropped on occupied seat (guest draggable, not chair droppable)"
            : parsedTarget.kind === "table-draggable"
              ? "Dropped on table surface — not a chair target"
              : "Collision picked a non-chair target",
      });
      return;
    }

    const table = tables.find((item) => item.id === chair.tableId);
    if (!table) {
      return;
    }

    if (chair.seatIndex < 0 || chair.seatIndex >= table.capacity) {
      setError("Seat is out of range for this table.");
      return;
    }

    if (
      guest.table_id === chair.tableId &&
      guest.seat_index === chair.seatIndex
    ) {
      return;
    }

    const occupant = guests.find(
      (item) =>
        item.id !== guestId &&
        item.table_id === chair.tableId &&
        item.seat_index === chair.seatIndex,
    );

    if (occupant) {
      setError("This seat is already taken.");
      return;
    }

    onGuestsChange(
      guests.map((item) => {
        if (item.id === guestId) {
          return {
            ...item,
            table_id: chair.tableId,
            seat_index: chair.seatIndex,
          };
        }
        return item;
      }),
    );

    startGuestTransition(async () => {
      const result = await assignGuestToSeatAction(
        guestId,
        chair.tableId,
        chair.seatIndex,
      );

      if (result.error) {
        onGuestsChange(previousGuests);
        setError(result.error);
        logSeatDnd("dragEnd:failed", {
          reason: "server rejected assignment",
          error: result.error,
        });
      } else {
        logSeatDnd("dragEnd:success", {
          guestId,
          tableId: chair.tableId,
          seatIndex: chair.seatIndex,
        });
      }
    });
  }

  function handleUnassignGuest(guestId: string) {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest || guest.seat_index === null) {
      return;
    }

    const previousGuests = guests;
    onGuestsChange(
      guests.map((item) =>
        item.id === guestId
          ? { ...item, table_id: null, seat_index: null }
          : item,
      ),
    );

    startGuestTransition(async () => {
      const result = await assignGuestToSeatAction(guestId, null, null);

      if (result.error) {
        onGuestsChange(previousGuests);
        setError(result.error);
      }
    });
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h4 className="text-base font-semibold tracking-tight text-zinc-100">
            Seating plan
          </h4>
          <p className={`mt-1 ${seatingPanelSubtext}`}>
            Drag guests to chairs · Click a table to edit · Drag tables to reposition
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ADD_BUTTONS.map(({ shape, label, shortLabel }, index) => (
            <button
              key={shape}
              type="button"
              onClick={() => {
                setError(null);
                setCreateShape(shape);
              }}
              className={
                index === 0 ? seatingBtnPrimary : seatingBtnSecondary
              }
              title={`Add ${label.toLowerCase()}`}
            >
              <span className="hidden sm:inline">Add </span>
              {shortLabel}
            </button>
          ))}
        </div>
      </div>

      {SEAT_DND_DEBUG && activeChairId && (
        <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
          Debug over: {activeChairId} ·{" "}
          {JSON.stringify(parseDropTarget(activeChairId))}
        </p>
      )}

      {error && (
        <p
          className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-2.5 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {!isMounted ? (
          <div className="flex min-w-0 flex-1 flex-col gap-4 xl:flex-row xl:items-start">
            <StaticGuestList guests={unassignedGuests} />
            <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl p-1">
              <StaticSeatingCanvas
                eventId={eventId}
                tables={tables}
                guestsBySeat={guestsBySeat}
              />
            </div>
          </div>
        ) : (
          <DndContext
            id={`seating-plan-${eventId}`}
            sensors={sensors}
            collisionDetection={seatingCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-4 xl:flex-row xl:items-start">
              <GuestListPanel eventId={eventId} guests={unassignedGuests} />

              <div className="min-w-0 flex-1 overflow-x-auto rounded-2xl p-1">
                <SeatingCanvas
                  eventId={eventId}
                  tables={tables}
                  guestsBySeat={guestsBySeat}
                  draggingTableId={draggingTableId}
                  selectedTableId={selectedTableId}
                  onDeselect={() => setSelectedTableId(null)}
                  onSelectTable={setSelectedTableId}
                  onUnassignGuest={handleUnassignGuest}
                  activeChairId={activeChairId}
                />
              </div>
            </div>

            <DragOverlay>
              {draggingTable ? (
                <OverlayCanvasTable
                  table={draggingTable}
                  eventId={eventId}
                  guestsBySeat={guestsBySeat}
                />
              ) : activeGuest ? (
                <GuestDragOverlay guest={activeGuest} />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

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

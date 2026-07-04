"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useActionState, useEffect, useMemo, useState, useTransition } from "react";

import {
  assignGuestToTableAction,
  createTable,
  type CreateTableState,
} from "./actions";

const initialCreateTableState: CreateTableState = {};

export type SeatingTable = {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
};

export type GoingGuest = {
  id: string;
  event_id: string;
  name: string;
  table_id: string | null;
};

type EventSeatingProps = {
  eventId: string;
  tables: SeatingTable[];
  goingGuests: GoingGuest[];
};

function guestDragId(eventId: string, guestId: string) {
  return `guest-${eventId}-${guestId}`;
}

function tableDropId(eventId: string, tableId: string) {
  return `table-${eventId}-${tableId}`;
}

function unassignedZoneId(eventId: string) {
  return `unassigned-${eventId}`;
}

function parseGuestDragId(id: string) {
  const parts = id.split("-");
  return parts[parts.length - 1] ?? "";
}

function parseTableDropId(id: string) {
  const parts = id.split("-");
  return parts[parts.length - 1] ?? "";
}

function StaticGuestCard({ guest }: { guest: GoingGuest }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950">
      {guest.name}
    </div>
  );
}

function DraggableGuestCard({
  guest,
  eventId,
  isOverlay = false,
}: {
  guest: GoingGuest;
  eventId: string;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: guestDragId(eventId, guest.id),
      data: { guest },
    });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-950 ${
        isDragging && !isOverlay ? "opacity-40" : ""
      } ${isOverlay ? "shadow-md ring-2 ring-zinc-300 dark:ring-zinc-600" : ""}`}
    >
      {guest.name}
    </div>
  );
}

function StaticTableZone({
  table,
  guests,
  isFull,
}: {
  table: SeatingTable;
  guests: GoingGuest[];
  isFull: boolean;
}) {
  return (
    <div
      className={`min-h-28 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50 ${
        isFull ? "opacity-60" : ""
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{table.name}</span>
        <span className="text-xs text-zinc-500">
          {guests.length}/{table.capacity}
          {isFull ? " · Full" : ""}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {guests.map((guest) => (
          <StaticGuestCard key={guest.id} guest={guest} />
        ))}
        {guests.length === 0 && (
          <p className="text-xs text-zinc-400">Drop guests here</p>
        )}
      </div>
    </div>
  );
}

function DraggableTableZone({
  table,
  guests,
  isFull,
  eventId,
}: {
  table: SeatingTable;
  guests: GoingGuest[];
  isFull: boolean;
  eventId: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: tableDropId(eventId, table.id),
    data: { table },
    disabled: isFull,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-28 rounded-xl border border-dashed p-3 transition-colors ${
        isOver && !isFull
          ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900"
          : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
      } ${isFull ? "opacity-60" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{table.name}</span>
        <span className="text-xs text-zinc-500">
          {guests.length}/{table.capacity}
          {isFull ? " · Full" : ""}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {guests.map((guest) => (
          <DraggableGuestCard key={guest.id} guest={guest} eventId={eventId} />
        ))}
        {guests.length === 0 && (
          <p className="text-xs text-zinc-400">Drop guests here</p>
        )}
      </div>
    </div>
  );
}

function StaticUnassignedZone({ guests }: { guests: GoingGuest[] }) {
  return (
    <div className="min-h-48 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/50">
      <h4 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Unassigned guests
      </h4>
      <div className="flex flex-col gap-2">
        {guests.map((guest) => (
          <StaticGuestCard key={guest.id} guest={guest} />
        ))}
        {guests.length === 0 && (
          <p className="text-xs text-zinc-400">
            All going guests are seated. Drag here to unassign.
          </p>
        )}
      </div>
    </div>
  );
}

function DraggableUnassignedZone({
  guests,
  eventId,
}: {
  guests: GoingGuest[];
  eventId: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: unassignedZoneId(eventId),
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-48 rounded-xl border border-dashed p-3 transition-colors ${
        isOver
          ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900"
          : "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50"
      }`}
    >
      <h4 className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Unassigned guests
      </h4>
      <div className="flex flex-col gap-2">
        {guests.map((guest) => (
          <DraggableGuestCard key={guest.id} guest={guest} eventId={eventId} />
        ))}
        {guests.length === 0 && (
          <p className="text-xs text-zinc-400">
            All going guests are seated. Drag here to unassign.
          </p>
        )}
      </div>
    </div>
  );
}

function StaticSeatingBoard({
  tables,
  guestsByTable,
  unassignedGuests,
}: {
  tables: SeatingTable[];
  guestsByTable: Map<string, GoingGuest[]>;
  unassignedGuests: GoingGuest[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StaticUnassignedZone guests={unassignedGuests} />
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Tables
        </h4>
        {tables.map((table) => {
          const tableGuests = guestsByTable.get(table.id) ?? [];
          return (
            <StaticTableZone
              key={table.id}
              table={table}
              guests={tableGuests}
              isFull={tableGuests.length >= table.capacity}
            />
          );
        })}
      </div>
    </div>
  );
}

function DraggableSeatingBoard({
  eventId,
  tables,
  guestsByTable,
  unassignedGuests,
}: {
  eventId: string;
  tables: SeatingTable[];
  guestsByTable: Map<string, GoingGuest[]>;
  unassignedGuests: GoingGuest[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DraggableUnassignedZone guests={unassignedGuests} eventId={eventId} />
      <div className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          Tables
        </h4>
        {tables.map((table) => {
          const tableGuests = guestsByTable.get(table.id) ?? [];
          return (
            <DraggableTableZone
              key={table.id}
              table={table}
              guests={tableGuests}
              isFull={tableGuests.length >= table.capacity}
              eventId={eventId}
            />
          );
        })}
      </div>
    </div>
  );
}

function CreateTableForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    createTable,
    initialCreateTableState,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="event_id" value={eventId} />

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`table-name-${eventId}`}
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Table name
        </label>
        <input
          id={`table-name-${eventId}`}
          name="name"
          type="text"
          required
          placeholder="Table 1"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`table-capacity-${eventId}`}
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
        >
          Capacity
        </label>
        <input
          id={`table-capacity-${eventId}`}
          name="capacity"
          type="number"
          min={1}
          required
          placeholder="8"
          className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {pending ? "Adding..." : "Add table"}
      </button>

      {state.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}

export function EventSeating({
  eventId,
  tables: initialTables,
  goingGuests: initialGoingGuests,
}: EventSeatingProps) {
  const [guests, setGuests] = useState(initialGoingGuests);
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setGuests(initialGoingGuests);
  }, [initialGoingGuests]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const tables = initialTables;

  const guestsByTable = useMemo(() => {
    const grouped = new Map<string, GoingGuest[]>();

    for (const table of tables) {
      grouped.set(table.id, []);
    }

    for (const guest of guests) {
      if (!guest.table_id) {
        continue;
      }

      const tableGuests = grouped.get(guest.table_id) ?? [];
      tableGuests.push(guest);
      grouped.set(guest.table_id, tableGuests);
    }

    return grouped;
  }, [guests, tables]);

  const unassignedGuests = guests.filter((guest) => !guest.table_id);
  const activeGuest = guests.find((guest) => guest.id === activeGuestId) ?? null;
  const unassignedId = unassignedZoneId(eventId);

  function handleDragStart(event: DragStartEvent) {
    setError(null);
    setActiveGuestId(parseGuestDragId(String(event.active.id)));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveGuestId(null);

    const { active, over } = event;
    if (!over) {
      return;
    }

    const guestId = parseGuestDragId(String(active.id));
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) {
      return;
    }

    let targetTableId: string | null = null;

    if (over.id === unassignedId) {
      targetTableId = null;
    } else if (String(over.id).startsWith(`table-${eventId}-`)) {
      targetTableId = parseTableDropId(String(over.id));
    } else {
      return;
    }

    if (guest.table_id === targetTableId) {
      return;
    }

    if (targetTableId !== null) {
      const table = tables.find((item) => item.id === targetTableId);
      const assignedCount = guestsByTable.get(targetTableId)?.length ?? 0;

      if (!table) {
        return;
      }

      if (assignedCount >= table.capacity && guest.table_id !== targetTableId) {
        setError(`${table.name} is full.`);
        return;
      }
    }

    const previousGuests = guests;
    setGuests((current) =>
      current.map((item) =>
        item.id === guestId ? { ...item, table_id: targetTableId } : item,
      ),
    );

    startTransition(async () => {
      const result = await assignGuestToTableAction(guestId, targetTableId);

      if (result.error) {
        setGuests(previousGuests);
        setError(result.error);
      }
    });
  }

  const boardProps = {
    tables,
    guestsByTable,
    unassignedGuests,
  };

  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <CreateTableForm eventId={eventId} />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      {tables.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Add a table to start assigning guests.
        </p>
      ) : guests.length === 0 ? (
        <p className="text-sm text-zinc-500">No guests marked as going.</p>
      ) : !isMounted ? (
        <StaticSeatingBoard {...boardProps} />
      ) : (
        <DndContext
          id={`seating-${eventId}`}
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <DraggableSeatingBoard eventId={eventId} {...boardProps} />

          <DragOverlay>
            {activeGuest ? (
              <div className="cursor-grabbing rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-md ring-2 ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:ring-zinc-600">
                {activeGuest.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

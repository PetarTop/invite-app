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

import type { RsvpStats } from "@/lib/rsvp-stats";
import { seatingCollisionDetection } from "@/lib/seating-collision";
import {
  activeChairIdFromOver,
  isGuestDragId,
  isLayoutTableDragId,
  parseChairDropData,
  parseGuestDragId,
  unassignedZoneId,
} from "@/lib/seating-dnd";
import { SEAT_DND_DEBUG, logSeatDnd } from "@/lib/seating-dnd-debug";
import {
  buildGuestsBySeat,
  normalizeGuestsForTables,
  type GoingGuest,
} from "@/lib/seating-guests";
import {
  clampTablePosition,
  parseLayoutTableDragId,
  type LayoutTable,
  type TableShape,
} from "@/lib/seating-layout";

import {
  assignGuestToSeatAction,
  updateTablePositionAction,
} from "../actions";
import { OverlayCanvasTable } from "./canvas-table";
import { CanvasWorkspace } from "./canvas-workspace";
import { CreateTableModal } from "./create-table-modal";
import { GuestDragOverlay } from "./guest-list-panel";
import { GuestSidebar } from "./guest-sidebar";
import { PropertiesPanel } from "./properties-panel";
import { SeatingCanvas, StaticSeatingCanvas } from "./seating-canvas";
import {
  SeatingToolbar,
  type StudioSaveStatus,
} from "./seating-toolbar";
import { studioMain, studioShell } from "./seating-ui";
import type { StudioTool } from "./tool-palette";

export type SeatingStudioProps = {
  eventId: string;
  eventName: string;
  tables: LayoutTable[];
  guests: GoingGuest[];
  rsvpStats: RsvpStats;
  onGuestsChange: (guests: GoingGuest[]) => void;
};

export function SeatingStudio({
  eventId,
  eventName,
  tables: initialTables,
  guests,
  rsvpStats,
  onGuestsChange,
}: SeatingStudioProps) {
  const [tables, setTables] = useState(initialTables);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [activeGuestId, setActiveGuestId] = useState<string | null>(null);
  const [activeChairId, setActiveChairId] = useState<string | null>(null);
  const [createShape, setCreateShape] = useState<TableShape | null>(null);
  const [activeTool, setActiveTool] = useState<StudioTool>("select");
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<StudioSaveStatus>("idle");
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

    logSeatDnd("init:expected-droppables", {
      eventId,
      tableCount: tables.length,
      chairDroppableCount: tables.reduce(
        (sum, table) => sum + table.capacity,
        0,
      ),
    });
  }, [eventId, tables]);

  useEffect(() => {
    if (saveStatus !== "saved") {
      return;
    }

    const timer = window.setTimeout(() => setSaveStatus("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const tableIds = useMemo(
    () => new Set(tables.map((table) => table.id)),
    [tables],
  );

  const displayGuests = useMemo(
    () => normalizeGuestsForTables(guests, tableIds),
    [guests, tableIds],
  );

  const guestsBySeat = useMemo(
    () => buildGuestsBySeat(displayGuests),
    [displayGuests],
  );

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [tables, selectedTableId],
  );

  const draggingTable =
    tables.find((table) => table.id === draggingTableId) ?? null;

  const activeGuest =
    displayGuests.find((guest) => guest.id === activeGuestId) ?? null;

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

  function handleAddTable(shape: TableShape) {
    setError(null);
    setCreateShape(shape);
    setActiveTool(
      shape === "round"
        ? "add-round"
        : shape === "rectangle"
          ? "add-rectangle"
          : "add-square",
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setError(null);
    const id = String(event.active.id);

    if (isLayoutTableDragId(id)) {
      const tableId = parseLayoutTableDragId(id);
      setDraggingTableId(tableId);
      setSelectedTableId(tableId);
      setActiveGuestId(null);
      setActiveTool("select");
      return;
    }

    if (isGuestDragId(id)) {
      setActiveGuestId(parseGuestDragId(id));
      setDraggingTableId(null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    setActiveChairId(activeChairIdFromOver(event.over));
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

    setSaveStatus("saving");
    startMoveTransition(async () => {
      const result = await updateTablePositionAction(
        tableId,
        nextPosition.x,
        nextPosition.y,
      );

      if (result.error) {
        setTables(previousTables);
        setError(result.error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
      }
    });
  }

  function handleGuestDragEnd(event: DragEndEvent) {
    setActiveGuestId(null);

    const { active, over } = event;
    const overId = over ? String(over.id) : null;

    if (!over) {
      return;
    }

    const guestId = parseGuestDragId(String(active.id));
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) {
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

      setSaveStatus("saving");
      startGuestTransition(async () => {
        const result = await assignGuestToSeatAction(guestId, null, null);
        if (result.error) {
          onGuestsChange(previousGuests);
          setError(result.error);
          setSaveStatus("idle");
        } else {
          setSaveStatus("saved");
        }
      });
      return;
    }

    const chair = parseChairDropData(over.data.current);
    if (!chair) {
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

    setSaveStatus("saving");
    startGuestTransition(async () => {
      const result = await assignGuestToSeatAction(
        guestId,
        chair.tableId,
        chair.seatIndex,
      );

      if (result.error) {
        onGuestsChange(previousGuests);
        setError(result.error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
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

    setSaveStatus("saving");
    startGuestTransition(async () => {
      const result = await assignGuestToSeatAction(guestId, null, null);

      if (result.error) {
        onGuestsChange(previousGuests);
        setError(result.error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
      }
    });
  }

  const studioBody = (
    <div className={studioMain}>
      <GuestSidebar
        eventId={eventId}
        guests={displayGuests}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onAddTable={handleAddTable}
      />

      <CanvasWorkspace error={error}>
        {!isMounted ? (
          <StaticSeatingCanvas
            eventId={eventId}
            tables={tables}
            guestsBySeat={guestsBySeat}
          />
        ) : (
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
        )}
      </CanvasWorkspace>

      <PropertiesPanel
        table={selectedTable}
        onUpdate={handleTableUpdate}
        onDelete={handleTableDelete}
        onError={setError}
        onClearSelection={() => setSelectedTableId(null)}
        onSaveStateChange={(status) => {
          if (status !== "idle") {
            setSaveStatus(status);
          }
        }}
      />
    </div>
  );

  return (
    <div className={studioShell}>
      <SeatingToolbar
        eventName={eventName}
        rsvpStats={rsvpStats}
        saveStatus={saveStatus}
        activeChairId={SEAT_DND_DEBUG ? activeChairId : null}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {!isMounted ? (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {studioBody}
          </div>
        ) : (
          <DndContext
            id={`seating-studio-${eventId}`}
            sensors={sensors}
            collisionDetection={seatingCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              {studioBody}
            </div>

            <DragOverlay dropAnimation={null}>
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
      </div>

      {createShape && (
        <CreateTableModal
          eventId={eventId}
          shape={createShape}
          defaultName={defaultTableName}
          onClose={() => {
            setCreateShape(null);
            setActiveTool("select");
          }}
          onError={setError}
        />
      )}
    </div>
  );
}

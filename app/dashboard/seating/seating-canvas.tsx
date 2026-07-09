"use client";

import {
  CANVAS_HEIGHT,
  CANVAS_ROOM_INSET,
  CANVAS_WIDTH,
  type LayoutTable,
} from "@/lib/seating-layout";
import type { GoingGuest } from "@/lib/seating-guests";

import { CanvasTable, StaticCanvasTable } from "./canvas-table";
import {
  seatingCanvasEmpty,
  studioFloorCanvas,
  studioRoomBoundary,
} from "./seating-ui";

type SeatingCanvasProps = {
  eventId: string;
  tables: LayoutTable[];
  guestsBySeat: Map<string, GoingGuest>;
  draggingTableId: string | null;
  selectedTableId: string | null;
  onDeselect: () => void;
  onSelectTable: (tableId: string) => void;
  onUnassignGuest: (guestId: string) => void;
  activeChairId: string | null;
};

export function SeatingCanvas({
  eventId,
  tables,
  guestsBySeat,
  draggingTableId,
  selectedTableId,
  onDeselect,
  onSelectTable,
  onUnassignGuest,
  activeChairId,
}: SeatingCanvasProps) {
  const floorWidth = CANVAS_WIDTH - CANVAS_ROOM_INSET * 2;
  const floorHeight = CANVAS_HEIGHT - CANVAS_ROOM_INSET * 2;

  return (
    <div
      className={studioFloorCanvas}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onDeselect();
        }
      }}
      role="presentation"
      data-seating-canvas
    >
      <div
        className={studioRoomBoundary}
        style={{
          left: CANVAS_ROOM_INSET,
          top: CANVAS_ROOM_INSET,
          width: floorWidth,
          height: floorHeight,
        }}
        aria-hidden
      >
        <span className="absolute left-3 top-3 text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Event floor
        </span>
      </div>

      {tables.length === 0 ? (
        <div className={seatingCanvasEmpty}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-600">
            <svg
              className="h-8 w-8"
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
          <p className="text-sm font-medium text-zinc-400">
            Your floor plan is empty
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-zinc-600">
            Use the tool palette to add tables, then drag guests from the sidebar
            onto chairs.
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

export function StaticSeatingCanvas({
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
      className={studioFloorCanvas}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
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

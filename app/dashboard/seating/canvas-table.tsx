"use client";

import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { GoingGuest } from "@/lib/seating-guests";
import { layoutTableDragId, type LayoutTable } from "@/lib/seating-layout";

import { TableWithChairs } from "./table-with-chairs";

type CanvasTableProps = {
  table: LayoutTable;
  eventId: string;
  guestsBySeat: Map<string, GoingGuest>;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onUnassignGuest?: (guestId: string) => void;
  highlightedDropId?: string | null;
};

function canvasTableStyle(
  table: LayoutTable,
  options?: { transform?: string; zIndex?: number },
): CSSProperties {
  return {
    position: "absolute",
    left: table.x,
    top: table.y,
    width: table.width,
    height: table.height,
    transform: options?.transform,
    zIndex: options?.zIndex,
    pointerEvents: "none",
  };
}

export function CanvasTable({
  table,
  eventId,
  guestsBySeat,
  isDragging = false,
  isSelected = false,
  onSelect,
  onUnassignGuest,
  highlightedDropId,
}: CanvasTableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: layoutTableDragId(eventId, table.id),
    data: { type: "table", table },
  });

  return (
    <div
      style={canvasTableStyle(table, {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging ? 40 : isSelected ? 2 : 1,
      })}
    >
      <TableWithChairs
        table={table}
        eventId={eventId}
        guestsBySeat={guestsBySeat}
        isDragging={isDragging}
        isSelected={isSelected}
        tableDragHandle={{ listeners, attributes, setNodeRef }}
        onSelectTable={onSelect}
        onUnassignGuest={onUnassignGuest}
        highlightedDropId={highlightedDropId}
      />
    </div>
  );
}

export function StaticCanvasTable({
  table,
  eventId,
  guestsBySeat,
}: {
  table: LayoutTable;
  eventId: string;
  guestsBySeat: Map<string, GoingGuest>;
}) {
  return (
    <div style={canvasTableStyle(table)}>
      <TableWithChairs
        table={table}
        eventId={eventId}
        guestsBySeat={guestsBySeat}
      />
    </div>
  );
}

export function OverlayCanvasTable({
  table,
  eventId,
  guestsBySeat,
}: {
  table: LayoutTable;
  eventId: string;
  guestsBySeat: Map<string, GoingGuest>;
}) {
  return (
    <div className="scale-[1.02] opacity-95 drop-shadow-2xl">
      <TableWithChairs
        table={table}
        eventId={eventId}
        guestsBySeat={guestsBySeat}
        isDragging
        className="cursor-grabbing"
      />
    </div>
  );
}

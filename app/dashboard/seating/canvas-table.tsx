"use client";

import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { layoutTableDragId, type LayoutTable } from "@/lib/seating-layout";

import { TableWithChairs } from "./table-with-chairs";

type CanvasTableProps = {
  table: LayoutTable;
  eventId: string;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
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
  };
}

export function CanvasTable({
  table,
  eventId,
  isDragging = false,
  isSelected = false,
  onSelect,
}: CanvasTableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: layoutTableDragId(eventId, table.id),
    data: { table },
  });

  return (
    <div
      ref={setNodeRef}
      style={canvasTableStyle(table, {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging || isSelected ? 20 : 1,
      })}
      className="cursor-grab active:cursor-grabbing"
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      {...listeners}
      {...attributes}
    >
      <TableWithChairs
        table={table}
        isDragging={isDragging}
        isSelected={isSelected}
      />
    </div>
  );
}

export function StaticCanvasTable({ table }: { table: LayoutTable }) {
  return (
    <div style={canvasTableStyle(table)}>
      <TableWithChairs table={table} />
    </div>
  );
}

export function OverlayCanvasTable({ table }: { table: LayoutTable }) {
  return (
    <TableWithChairs
      table={table}
      isDragging
      className="cursor-grabbing shadow-lg"
    />
  );
}

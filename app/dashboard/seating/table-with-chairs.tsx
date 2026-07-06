"use client";

import type { CSSProperties, ReactNode } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

import { calculateChairPositionsForTable } from "@/lib/seating-chairs";
import type { GoingGuest } from "@/lib/seating-guests";
import { seatKey } from "@/lib/seating-guests";
import type { LayoutTable } from "@/lib/seating-layout";

import { ChairSeat } from "./chair-seat";

type TableWithChairsProps = {
  table: LayoutTable;
  eventId: string;
  guestsBySeat: Map<string, GoingGuest>;
  isDragging?: boolean;
  isSelected?: boolean;
  className?: string;
  surfaceClassName?: string;
  tableDragHandle?: {
    listeners?: SyntheticListenerMap;
    attributes?: DraggableAttributes;
    setNodeRef?: (element: HTMLElement | null) => void;
  };
  onSelectTable?: () => void;
  onUnassignGuest?: (guestId: string) => void;
  highlightedDropId?: string | null;
};

function TableSurface({
  table,
  isDragging,
  isSelected,
  className,
  tableDragHandle,
  onSelectTable,
}: {
  table: LayoutTable;
  isDragging?: boolean;
  isSelected?: boolean;
  className?: string;
  tableDragHandle?: TableWithChairsProps["tableDragHandle"];
  onSelectTable?: () => void;
}) {
  const borderRadius =
    table.shape === "round"
      ? "9999px"
      : table.shape === "square"
        ? "12px"
        : "10px";

  return (
    <div
      ref={tableDragHandle?.setNodeRef}
      className={`flex h-full w-full cursor-grab flex-col items-center justify-center border-2 bg-white/95 px-2 text-center shadow-sm active:cursor-grabbing dark:bg-zinc-950/95 ${
        isSelected
          ? "border-amber-500 ring-2 ring-amber-400/60 ring-offset-2 ring-offset-transparent dark:border-amber-400 dark:ring-amber-500/50"
          : "border-zinc-300 dark:border-zinc-600"
      } ${
        isDragging ? "ring-2 ring-zinc-400 dark:ring-zinc-500" : ""
      } ${className ?? ""}`}
      style={{ borderRadius }}
      onClick={(event) => {
        event.stopPropagation();
        onSelectTable?.();
      }}
      {...tableDragHandle?.listeners}
      {...tableDragHandle?.attributes}
    >
      <span className="pointer-events-none truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
        {table.name}
      </span>
      <span className="pointer-events-none text-[10px] text-zinc-500 dark:text-zinc-400">
        {table.capacity} seats
      </span>
    </div>
  );
}

export function TableWithChairs({
  table,
  eventId,
  guestsBySeat,
  isDragging,
  isSelected,
  className,
  surfaceClassName,
  tableDragHandle,
  onSelectTable,
  onUnassignGuest,
  highlightedDropId,
  children,
}: TableWithChairsProps & { children?: ReactNode }) {
  const chairs = calculateChairPositionsForTable(table);

  return (
    <div
      className={`relative overflow-visible ${className ?? ""}`}
      style={{
        width: table.width,
        height: table.height,
        transform: `rotate(${table.rotation}deg)`,
        transformOrigin: "center center",
      }}
    >
      {/* Table body — below chairs, does not capture pointer events outside surface */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="pointer-events-auto absolute inset-0">
          <TableSurface
            table={table}
            isDragging={isDragging}
            isSelected={isSelected}
            className={surfaceClassName}
            tableDragHandle={tableDragHandle}
            onSelectTable={onSelectTable}
          />
        </div>
      </div>

      {/* Chairs — above table body, each hitbox receives drops */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {chairs.map((chair, index) => (
          <ChairSeat
            key={index}
            eventId={eventId}
            tableId={table.id}
            tableName={table.name}
            seatIndex={index}
            seatNumber={index + 1}
            x={chair.x}
            y={chair.y}
            rotation={chair.rotation}
            guest={guestsBySeat.get(seatKey(table.id, index)) ?? null}
            onUnassignGuest={onUnassignGuest}
            highlightedDropId={highlightedDropId}
          />
        ))}
      </div>

      {children}
    </div>
  );
}

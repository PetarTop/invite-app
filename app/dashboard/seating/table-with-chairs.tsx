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

function tableShapeStyles(table: LayoutTable) {
  const borderRadius =
    table.shape === "round"
      ? "9999px"
      : table.shape === "square"
        ? "14px"
        : "12px";

  const surfaceGradient =
    table.shape === "round"
      ? "bg-[radial-gradient(ellipse_at_center,_#3f3f46_0%,_#27272a_55%,_#18181b_100%)]"
      : "bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900";

  return { borderRadius, surfaceGradient };
}

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
  const { borderRadius, surfaceGradient } = tableShapeStyles(table);

  return (
    <div
      ref={tableDragHandle?.setNodeRef}
      className={`group/table relative flex h-full w-full cursor-grab flex-col items-center justify-center border px-2 text-center shadow-lg transition-all duration-200 active:cursor-grabbing ${surfaceGradient} ${
        isSelected
          ? "border-amber-400/70 shadow-amber-500/15 ring-2 ring-amber-400/35"
          : "border-zinc-600/60 shadow-black/30 hover:border-zinc-500/80 hover:shadow-xl hover:shadow-black/40"
      } ${
        isDragging
          ? "scale-[1.02] border-zinc-500/80 opacity-90 shadow-2xl ring-2 ring-zinc-400/30"
          : ""
      } ${className ?? ""}`}
      style={{ borderRadius }}
      onClick={(event) => {
        event.stopPropagation();
        onSelectTable?.();
      }}
      {...tableDragHandle?.listeners}
      {...tableDragHandle?.attributes}
    >
      <div
        className="pointer-events-none absolute inset-[3px] opacity-40"
        style={{
          borderRadius:
            table.shape === "round"
              ? "9999px"
              : table.shape === "square"
                ? "11px"
                : "9px",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.35)",
        }}
      />
      <span className="pointer-events-none relative z-[1] max-w-full truncate text-xs font-semibold tracking-tight text-zinc-100 drop-shadow-sm">
        {table.name}
      </span>
      <span className="pointer-events-none relative z-[1] mt-0.5 text-[10px] font-medium text-zinc-400">
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

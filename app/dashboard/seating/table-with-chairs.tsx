import type { ReactNode } from "react";

import {
  CHAIR_HEIGHT,
  CHAIR_WIDTH,
  calculateChairPositionsForTable,
} from "@/lib/seating-chairs";
import type { LayoutTable } from "@/lib/seating-layout";

type TableWithChairsProps = {
  table: LayoutTable;
  isDragging?: boolean;
  isSelected?: boolean;
  className?: string;
  surfaceClassName?: string;
};

function Chair({ x, y, rotation }: { x: number; y: number; rotation: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute rounded-sm border border-zinc-400 bg-zinc-300 shadow-sm dark:border-zinc-600 dark:bg-zinc-600"
      style={{
        left: x - CHAIR_WIDTH / 2,
        top: y - CHAIR_HEIGHT / 2,
        width: CHAIR_WIDTH,
        height: CHAIR_HEIGHT,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center center",
      }}
    />
  );
}

function TableSurface({
  table,
  isDragging,
  isSelected,
  className,
}: {
  table: LayoutTable;
  isDragging?: boolean;
  isSelected?: boolean;
  className?: string;
}) {
  const borderRadius =
    table.shape === "round"
      ? "9999px"
      : table.shape === "square"
        ? "12px"
        : "10px";

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center border-2 bg-white/95 px-2 text-center shadow-sm dark:bg-zinc-950/95 ${
        isSelected
          ? "border-amber-500 ring-2 ring-amber-400/60 ring-offset-2 ring-offset-transparent dark:border-amber-400 dark:ring-amber-500/50"
          : "border-zinc-300 dark:border-zinc-600"
      } ${
        isDragging ? "ring-2 ring-zinc-400 dark:ring-zinc-500" : ""
      } ${className ?? ""}`}
      style={{ borderRadius }}
    >
      <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
        {table.name}
      </span>
      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
        {table.capacity} seats
      </span>
    </div>
  );
}

export function TableWithChairs({
  table,
  isDragging,
  isSelected,
  className,
  surfaceClassName,
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
      <div className="absolute inset-0">
        <TableSurface
          table={table}
          isDragging={isDragging}
          isSelected={isSelected}
          className={surfaceClassName}
        />
      </div>

      {chairs.map((chair, index) => (
        <Chair key={index} x={chair.x} y={chair.y} rotation={chair.rotation} />
      ))}

      {children}
    </div>
  );
}

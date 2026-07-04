"use client";

import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import {
  layoutTableDragId,
  type LayoutTable,
} from "@/lib/seating-layout";

type CanvasTableProps = {
  table: LayoutTable;
  eventId: string;
  isDragging?: boolean;
};

export function CanvasTable({
  table,
  eventId,
  isDragging = false,
}: CanvasTableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: layoutTableDragId(eventId, table.id),
    data: { table },
  });

  const borderRadius =
    table.shape === "round" ? "9999px" : table.shape === "square" ? "12px" : "10px";

  const style: CSSProperties = {
    position: "absolute",
    left: table.x,
    top: table.y,
    width: table.width,
    height: table.height,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div
        className={`flex h-full w-full cursor-grab flex-col items-center justify-center border-2 border-zinc-300 bg-white/95 px-2 text-center shadow-sm active:cursor-grabbing dark:border-zinc-600 dark:bg-zinc-950/95 ${
          isDragging ? "ring-2 ring-zinc-400 dark:ring-zinc-500" : ""
        }`}
        style={{
          borderRadius,
          transform: `rotate(${table.rotation}deg)`,
        }}
      >
        <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {table.name}
        </span>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
          {table.capacity} seats
        </span>
      </div>
    </div>
  );
}

export function StaticCanvasTable({ table }: { table: LayoutTable }) {
  const borderRadius =
    table.shape === "round" ? "9999px" : table.shape === "square" ? "12px" : "10px";

  return (
    <div
      style={{
        position: "absolute",
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height,
      }}
    >
      <div
        className="flex h-full w-full flex-col items-center justify-center border-2 border-zinc-300 bg-white/95 px-2 text-center shadow-sm dark:border-zinc-600 dark:bg-zinc-950/95"
        style={{
          borderRadius,
          transform: `rotate(${table.rotation}deg)`,
        }}
      >
        <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {table.name}
        </span>
        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
          {table.capacity} seats
        </span>
      </div>
    </div>
  );
}

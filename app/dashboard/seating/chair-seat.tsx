"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";

import { getGuestInitials } from "@/lib/guest-initials";
import { logSeatDnd } from "@/lib/seating-dnd-debug";
import { CHAIR_HITBOX_SIZE, CHAIR_VISUAL_SIZE } from "@/lib/seating-chairs";
import {
  chairDropData,
  chairDropId,
  guestDragId,
} from "@/lib/seating-dnd";
import type { GoingGuest } from "@/lib/seating-guests";

type ChairPositionStyle = {
  x: number;
  y: number;
  rotation: number;
};

function chairHitboxStyle({ x, y, rotation }: ChairPositionStyle) {
  return {
    left: x - CHAIR_HITBOX_SIZE / 2,
    top: y - CHAIR_HITBOX_SIZE / 2,
    width: CHAIR_HITBOX_SIZE,
    height: CHAIR_HITBOX_SIZE,
    transform: `rotate(${rotation}deg)`,
    transformOrigin: "center center" as const,
  };
}

function ChairTooltip({
  guestName,
  tableName,
  seatNumber,
  rotation,
}: {
  guestName: string;
  tableName: string;
  seatNumber: number;
  rotation: number;
}) {
  return (
    <div
      className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-50 w-max max-w-[140px] rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-left opacity-0 shadow-md transition-opacity group-hover/chair:opacity-100 dark:border-zinc-700 dark:bg-zinc-900"
      style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
    >
      <p className="truncate text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
        {guestName}
      </p>
      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
        {tableName} · Seat {seatNumber}
      </p>
    </div>
  );
}

function EmptyChairVisual({ isHighlighted }: { isHighlighted: boolean }) {
  return (
    <div
      className="pointer-events-none flex items-center justify-center"
      style={{ width: CHAIR_HITBOX_SIZE, height: CHAIR_HITBOX_SIZE }}
    >
      <div
        className={`rounded-full border-2 border-dashed transition-all ${
          isHighlighted
            ? "scale-110 border-emerald-500 bg-emerald-200/90 shadow-md ring-2 ring-emerald-400 dark:border-emerald-400 dark:bg-emerald-900/80 dark:ring-emerald-500"
            : "border-zinc-300/80 bg-zinc-100/60 dark:border-zinc-600/80 dark:bg-zinc-800/40"
        }`}
        style={{ width: CHAIR_VISUAL_SIZE, height: CHAIR_VISUAL_SIZE }}
      />
    </div>
  );
}

function EmptyChairDrop({
  tableId,
  tableName,
  seatIndex,
  seatNumber,
  position,
  isGlobalHoverTarget,
}: {
  tableId: string;
  tableName: string;
  seatIndex: number;
  seatNumber: number;
  position: ChairPositionStyle;
  isGlobalHoverTarget?: boolean;
}) {
  const dropId = chairDropId(tableId, seatIndex);

  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    data: chairDropData(tableId, seatIndex),
  });

  const isHighlighted = isOver || Boolean(isGlobalHoverTarget);

  useEffect(() => {
    logSeatDnd("droppable:registered", {
      dropId,
      tableId,
      tableName,
      seatIndex,
      seatNumber,
      hitbox: CHAIR_HITBOX_SIZE,
    });
  }, [dropId, tableId, tableName, seatIndex, seatNumber]);

  return (
    <div
      ref={setNodeRef}
      className="pointer-events-auto absolute z-30"
      style={chairHitboxStyle(position)}
      data-seat-debug={dropId}
    >
      <EmptyChairVisual isHighlighted={isHighlighted} />
    </div>
  );
}

function OccupiedChair({
  eventId,
  guest,
  tableName,
  seatNumber,
  position,
  onUnassignGuest,
}: {
  eventId: string;
  guest: GoingGuest;
  tableName: string;
  seatNumber: number;
  position: ChairPositionStyle;
  onUnassignGuest?: (guestId: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = getGuestInitials(guest.name);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: guestDragId(eventId, guest.id),
      data: { guest },
    });

  const dragStyle = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  return (
    <div
      ref={setNodeRef}
      className="pointer-events-auto absolute z-30"
      style={{
        ...chairHitboxStyle(position),
        ...dragStyle,
      }}
    >
      <div
        ref={menuRef}
        className="relative flex items-center justify-center"
        style={{ width: CHAIR_HITBOX_SIZE, height: CHAIR_HITBOX_SIZE }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
          className={`flex cursor-grab items-center justify-center rounded-full border-2 text-[9px] font-semibold tracking-wide transition-all active:cursor-grabbing ${
            menuOpen
              ? "border-amber-500 bg-amber-100 text-amber-900 ring-2 ring-amber-400/50 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-100"
              : "border-amber-600/80 bg-amber-500 text-white shadow-sm hover:scale-105 hover:border-amber-700 hover:bg-amber-600 dark:border-amber-500/80 dark:bg-amber-600 dark:hover:bg-amber-500"
          } ${isDragging ? "opacity-50" : ""}`}
          style={{ width: CHAIR_VISUAL_SIZE, height: CHAIR_VISUAL_SIZE }}
          {...listeners}
          {...attributes}
        >
          {initials}
        </button>

        {!menuOpen && (
          <ChairTooltip
            guestName={guest.name}
            tableName={tableName}
            seatNumber={seatNumber}
            rotation={position.rotation}
          />
        )}

        {menuOpen && (
          <div
            className="absolute bottom-[calc(100%+6px)] left-1/2 z-50 w-max rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            style={{
              transform: `translateX(-50%) rotate(${-position.rotation}deg)`,
            }}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                onUnassignGuest?.(guest.id);
              }}
              className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
            >
              Remove from seat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChairSeat({
  eventId,
  tableId,
  tableName,
  seatIndex,
  seatNumber,
  x,
  y,
  rotation,
  guest,
  onUnassignGuest,
  highlightedDropId,
}: {
  eventId: string;
  tableId: string;
  tableName: string;
  seatIndex: number;
  seatNumber: number;
  x: number;
  y: number;
  rotation: number;
  guest: GoingGuest | null;
  onUnassignGuest?: (guestId: string) => void;
  highlightedDropId?: string | null;
}) {
  const position = { x, y, rotation };
  const dropId = chairDropId(tableId, seatIndex);

  if (guest) {
    return (
      <OccupiedChair
        eventId={eventId}
        guest={guest}
        tableName={tableName}
        seatNumber={seatNumber}
        position={position}
        onUnassignGuest={onUnassignGuest}
      />
    );
  }

  return (
    <EmptyChairDrop
      tableId={tableId}
      tableName={tableName}
      seatIndex={seatIndex}
      seatNumber={seatNumber}
      position={position}
      isGlobalHoverTarget={highlightedDropId === dropId}
    />
  );
}

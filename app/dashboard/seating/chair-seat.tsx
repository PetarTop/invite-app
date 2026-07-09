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
      className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-max max-w-[160px] rounded-lg border border-zinc-700/80 bg-zinc-900/95 px-2.5 py-2 text-left opacity-0 shadow-lg shadow-black/40 backdrop-blur-sm transition-all duration-200 group-hover/chair:opacity-100"
      style={{ transform: `translateX(-50%) rotate(${-rotation}deg)` }}
      role="tooltip"
    >
      <p className="truncate text-[11px] font-semibold text-zinc-100">
        {guestName}
      </p>
      <p className="mt-0.5 text-[10px] text-zinc-400">
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
        className={`relative rounded-full transition-all duration-150 ${
          isHighlighted
            ? "scale-110 shadow-lg shadow-emerald-500/40"
            : "group-hover/chair:scale-105 group-hover/chair:border-zinc-400/80"
        }`}
        style={{ width: CHAIR_VISUAL_SIZE, height: CHAIR_VISUAL_SIZE }}
      >
        <div
          className={`absolute inset-0 rounded-full border-2 transition-all duration-150 ${
            isHighlighted
              ? "border-emerald-400 bg-emerald-500/30 ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-zinc-950"
              : "border-dashed border-zinc-600/70 bg-zinc-800/50 group-hover/chair:border-zinc-500 group-hover/chair:bg-zinc-700/50"
          }`}
        />
        {isHighlighted && (
          <div className="absolute -inset-1 rounded-full bg-emerald-400/20 blur-[2px]" />
        )}
      </div>
    </div>
  );
}

function EmptyChairDrop({
  tableId,
  tableName,
  seatIndex,
  seatNumber,
  position,
  activeChairId,
}: {
  tableId: string;
  tableName: string;
  seatIndex: number;
  seatNumber: number;
  position: ChairPositionStyle;
  activeChairId?: string | null;
}) {
  const dropId = chairDropId(tableId, seatIndex);

  const { setNodeRef } = useDroppable({
    id: dropId,
    data: chairDropData(tableId, seatIndex),
  });

  const isHighlighted = activeChairId === dropId;

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
      className="group/chair pointer-events-auto absolute z-40 cursor-pointer"
      style={chairHitboxStyle(position)}
      data-seat-debug={dropId}
      aria-label={`Empty seat ${seatNumber} at ${tableName}`}
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
      className="group/chair pointer-events-auto absolute z-40"
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
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={`${guest.name}, seat ${seatNumber} at ${tableName}`}
          className={`flex cursor-grab items-center justify-center rounded-full border text-[10px] font-bold tracking-tight transition-all duration-200 active:cursor-grabbing ${
            menuOpen
              ? "scale-105 border-amber-300 bg-gradient-to-br from-amber-300 to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300/60"
              : "border-amber-400/50 bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 shadow-md shadow-amber-950/50 hover:scale-105 hover:from-amber-300 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30"
          } ${isDragging ? "opacity-40" : ""}`}
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
            className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-max rounded-lg border border-zinc-700/80 bg-zinc-900/95 p-1 shadow-xl shadow-black/40 backdrop-blur-sm"
            style={{
              transform: `translateX(-50%) rotate(${-position.rotation}deg)`,
            }}
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen(false);
                onUnassignGuest?.(guest.id);
              }}
              className="whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-950/60"
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
  activeChairId,
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
  activeChairId?: string | null;
}) {
  const position = { x, y, rotation };

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
      activeChairId={activeChairId}
    />
  );
}

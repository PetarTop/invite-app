"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { GoingGuest } from "@/lib/seating-guests";
import { guestDragId, unassignedZoneId } from "@/lib/seating-dnd";

import { seatingPanel, seatingPanelHeader, seatingPanelSubtext } from "./seating-ui";

type GuestListPanelProps = {
  eventId: string;
  guests: GoingGuest[];
};

export function DraggableGuestCard({
  guest,
  eventId,
  isOverlay = false,
}: {
  guest: GoingGuest;
  eventId: string;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: guestDragId(eventId, guest.id),
      data: { guest },
    });

  const style =
    isDragging || isOverlay
      ? undefined
      : transform
        ? { transform: CSS.Translate.toString(transform) }
        : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex w-full max-w-full cursor-grab items-center gap-2 overflow-hidden rounded-lg border border-zinc-700/70 bg-zinc-800/50 px-3 py-2.5 text-sm text-zinc-100 shadow-sm transition-all duration-200 active:cursor-grabbing touch-none ${
        isDragging && !isOverlay ? "opacity-30" : ""
      } ${
        isOverlay
          ? "scale-105 border-amber-500/50 bg-zinc-800 shadow-xl shadow-black/40 ring-2 ring-amber-400/40"
          : "hover:border-zinc-600 hover:bg-zinc-800 hover:shadow-md hover:shadow-black/20"
      }`}
    >
      <span
        className="flex shrink-0 flex-col gap-0.5 text-zinc-600 group-hover:text-zinc-500"
        aria-hidden
      >
        <span className="block h-0.5 w-1 rounded-full bg-current" />
        <span className="block h-0.5 w-1 rounded-full bg-current" />
        <span className="block h-0.5 w-1 rounded-full bg-current" />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{guest.name}</span>
    </div>
  );
}

export function GuestListPanel({ eventId, guests }: GuestListPanelProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: unassignedZoneId(eventId),
  });

  return (
    <aside className={`w-full shrink-0 lg:w-56 xl:w-60 ${seatingPanel}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className={seatingPanelHeader}>Guests</h4>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-400">
          {guests.length}
        </span>
      </div>
      <p className={`mt-1 ${seatingPanelSubtext}`}>
        Drag guests onto empty chairs.
      </p>

      <div
        ref={setNodeRef}
        className={`mt-3 flex min-h-36 flex-col gap-2 rounded-xl border border-dashed p-2.5 transition-all duration-200 ${
          isOver
            ? "border-amber-500/60 bg-amber-500/5 shadow-inner shadow-amber-500/10"
            : "border-zinc-700/60 bg-zinc-950/40"
        }`}
      >
        {guests.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-zinc-400">
              Everyone is seated
            </p>
            <p className="text-[11px] leading-relaxed text-zinc-600">
              Drag a guest here to unassign them from their seat.
            </p>
          </div>
        ) : (
          guests.map((guest) => (
            <DraggableGuestCard key={guest.id} guest={guest} eventId={eventId} />
          ))
        )}
      </div>
    </aside>
  );
}

export function GuestDragOverlay({ guest }: { guest: GoingGuest }) {
  return (
    <div className="pointer-events-none w-64 max-w-[min(16rem,calc(100vw-2rem))] cursor-grabbing touch-none">
      <div className="flex scale-105 items-center gap-2 overflow-hidden rounded-lg border border-amber-500/50 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 shadow-xl shadow-black/40 ring-2 ring-amber-400/40">
        <span
          className="flex shrink-0 flex-col gap-0.5 text-zinc-500"
          aria-hidden
        >
          <span className="block h-0.5 w-1 rounded-full bg-current" />
          <span className="block h-0.5 w-1 rounded-full bg-current" />
          <span className="block h-0.5 w-1 rounded-full bg-current" />
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{guest.name}</span>
      </div>
    </div>
  );
}

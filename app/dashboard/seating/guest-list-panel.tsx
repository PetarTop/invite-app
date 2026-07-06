"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { GoingGuest } from "@/lib/seating-guests";
import { guestDragId, unassignedZoneId } from "@/lib/seating-dnd";

type GuestListPanelProps = {
  eventId: string;
  guests: GoingGuest[];
};

function DraggableGuestCard({
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

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-950 ${
        isDragging && !isOverlay ? "opacity-40" : ""
      } ${isOverlay ? "shadow-md ring-2 ring-zinc-300 dark:ring-zinc-600" : ""}`}
    >
      {guest.name}
    </div>
  );
}

export function GuestListPanel({ eventId, guests }: GuestListPanelProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: unassignedZoneId(eventId),
  });

  return (
    <aside className="w-full shrink-0 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 lg:w-52">
      <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Unassigned guests
      </h4>
      <p className="mt-1 text-xs text-zinc-500">
        Drag guests onto chairs on the canvas.
      </p>

      <div
        ref={setNodeRef}
        className={`mt-3 flex min-h-32 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors ${
          isOver
            ? "border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
      >
        {guests.length === 0 ? (
          <p className="px-1 py-2 text-xs text-zinc-400">
            All going guests are seated. Drag here to unassign.
          </p>
        ) : (
          guests.map((guest) => (
            <DraggableGuestCard key={guest.id} guest={guest} eventId={eventId} />
          ))
        )}
      </div>
    </aside>
  );
}

export function GuestDragOverlay({
  guest,
  eventId,
}: {
  guest: GoingGuest;
  eventId: string;
}) {
  return (
    <DraggableGuestCard guest={guest} eventId={eventId} isOverlay />
  );
}

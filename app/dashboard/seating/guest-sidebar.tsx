"use client";

import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";

import {
  isGuestSeatedOnChair,
  isGuestUnassignedForCanvas,
  type GoingGuest,
} from "@/lib/seating-guests";
import { unassignedZoneId } from "@/lib/seating-dnd";

import { DraggableGuestCard } from "./guest-list-panel";
import { studioSidebar, studioSidebarSection } from "./seating-ui";
import { ToolPalette, type StudioTool } from "./tool-palette";

export type GuestFilter = "unassigned" | "seated" | "all";

type GuestSidebarProps = {
  eventId: string;
  guests: GoingGuest[];
  activeTool: StudioTool;
  onSelectTool: (tool: StudioTool) => void;
  onAddTable: (shape: import("@/lib/seating-layout").TableShape) => void;
};

export function GuestSidebar({
  eventId,
  guests,
  activeTool,
  onSelectTool,
  onAddTable,
}: GuestSidebarProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GuestFilter>("unassigned");

  const { isOver, setNodeRef } = useDroppable({
    id: unassignedZoneId(eventId),
  });

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return guests.filter((guest) => {
      if (filter === "unassigned" && !isGuestUnassignedForCanvas(guest)) {
        return false;
      }
      if (filter === "seated" && !isGuestSeatedOnChair(guest)) {
        return false;
      }
      if (query && !guest.name.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [guests, filter, search]);

  const unassignedCount = guests.filter(isGuestUnassignedForCanvas).length;

  return (
    <aside className={`${studioSidebar} flex h-auto w-full shrink-0 flex-col border-r xl:h-full xl:w-80`}>
      <div className={studioSidebarSection}>
        <ToolPalette
          activeTool={activeTool}
          onSelectTool={onSelectTool}
          onAddTable={onAddTable}
        />
      </div>

      <div className={`flex min-h-0 flex-1 flex-col ${studioSidebarSection}`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-100">Guests</h2>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-400">
            {unassignedCount} free
          </span>
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search guests…"
          className="mb-3 w-full rounded-lg border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
        />

        <div className="mb-3 flex gap-1 rounded-lg bg-zinc-950/60 p-1">
          {(
            [
              ["unassigned", "Unassigned"],
              ["seated", "Seated"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                filter === value
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          ref={setNodeRef}
          className={`flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-dashed p-2 transition-colors ${
            isOver
              ? "border-amber-500/50 bg-amber-500/5"
              : "border-zinc-700/50 bg-zinc-950/30"
          }`}
        >
          {filteredGuests.length === 0 ? (
            <EmptyGuestState filter={filter} search={search} />
          ) : (
            filteredGuests.map((guest) =>
              isGuestUnassignedForCanvas(guest) ? (
                <DraggableGuestCard
                  key={guest.id}
                  guest={guest}
                  eventId={eventId}
                />
              ) : (
                <SeatedGuestRow key={guest.id} guest={guest} />
              ),
            )
          )}
        </div>

        <p className="mt-2 text-[10px] leading-relaxed text-zinc-600">
          Drag unassigned guests to chairs. Drop here to unassign.
        </p>
      </div>
    </aside>
  );
}

function SeatedGuestRow({ guest }: { guest: GoingGuest }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-400">
      <span className="min-w-0 flex-1 truncate font-medium text-zinc-300">
        {guest.name}
      </span>
      <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-500">
        Seated
      </span>
    </div>
  );
}

function EmptyGuestState({
  filter,
  search,
}: {
  filter: GuestFilter;
  search: string;
}) {
  if (search.trim()) {
    return (
      <p className="px-2 py-8 text-center text-xs text-zinc-500">
        No guests match &ldquo;{search.trim()}&rdquo;
      </p>
    );
  }

  if (filter === "unassigned") {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          ✓
        </div>
        <p className="text-xs font-medium text-zinc-400">Everyone is seated</p>
        <p className="text-[11px] text-zinc-600">
          Drag seated guests here to unassign
        </p>
      </div>
    );
  }

  if (filter === "seated") {
    return (
      <p className="px-2 py-8 text-center text-xs text-zinc-500">
        No seated guests yet.
      </p>
    );
  }

  return (
    <p className="px-2 py-8 text-center text-xs text-zinc-500">
      No going guests for this event.
    </p>
  );
}

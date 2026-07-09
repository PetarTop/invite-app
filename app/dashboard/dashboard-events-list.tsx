"use client";

import { useMemo } from "react";

import type { GuestRealtimeRow } from "@/lib/guest-realtime";
import { useGuestRealtime } from "@/lib/hooks/use-guest-realtime";
import { calculateRsvpStats } from "@/lib/rsvp-stats";
import type { LayoutTable } from "@/lib/seating-layout";

import { OpenSeatingPlannerLink } from "./open-seating-planner-link";
import {
  RsvpToastStack,
  useRsvpToasts,
} from "./components/rsvp-toast-stack";

type DashboardEvent = {
  id: string;
  name: string;
  slug: string;
};

type DashboardEventsListProps = {
  events: DashboardEvent[];
  initialGuests: GuestRealtimeRow[];
  tablesByEventId: Record<string, LayoutTable[]>;
};

export function DashboardEventsList({
  events,
  initialGuests,
  tablesByEventId,
}: DashboardEventsListProps) {
  const { toasts, showToast, dismissToast } = useRsvpToasts();
  const eventIds = useMemo(() => events.map((event) => event.id), [events]);

  const { guests } = useGuestRealtime({
    eventIds,
    initialGuests,
    onRsvpToast: showToast,
  });

  const guestsByEventId = useMemo(() => {
    const grouped = new Map<string, { status: string | null }[]>();

    for (const guest of guests) {
      const eventGuests = grouped.get(guest.event_id) ?? [];
      eventGuests.push({ status: guest.status });
      grouped.set(guest.event_id, eventGuests);
    }

    return grouped;
  }, [guests]);

  return (
    <>
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
        {events.map((event) => {
          const stats = calculateRsvpStats(
            guestsByEventId.get(event.id) ?? null,
          );

          return (
            <li key={event.id} className="px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{event.name}</span>
                  <code className="w-fit rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                    {event.slug}
                  </code>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                    Going: {stats.going}
                  </span>
                  <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                    Not going: {stats.not_going}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    Pending: {stats.pending}
                  </span>
                </div>
              </div>

              <OpenSeatingPlannerLink
                eventId={event.id}
                goingCount={stats.going}
                tableCount={tablesByEventId[event.id]?.length ?? 0}
              />
            </li>
          );
        })}
      </ul>

      <RsvpToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

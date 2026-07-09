"use client";

import { useMemo } from "react";

import type { GuestRealtimeRow } from "@/lib/guest-realtime";
import { useGuestRealtime } from "@/lib/hooks/use-guest-realtime";

import { EventCard } from "./components/event-card";
import {
  RsvpToastStack,
  useRsvpToasts,
} from "./components/rsvp-toast-stack";

type DashboardEvent = {
  id: string;
  name: string;
  slug: string;
  package_tier: string | null;
  seating_enabled: boolean;
};

type DashboardEventsListProps = {
  events: DashboardEvent[];
  initialGuests: GuestRealtimeRow[];
};

export function DashboardEventsList({
  events,
  initialGuests,
}: DashboardEventsListProps) {
  const { toasts, showToast, dismissToast } = useRsvpToasts();
  const eventIds = useMemo(() => events.map((event) => event.id), [events]);

  const { guests } = useGuestRealtime({
    eventIds,
    initialGuests,
    onRsvpToast: showToast,
  });

  const guestsByEventId = useMemo(() => {
    const grouped = new Map<string, GuestRealtimeRow[]>();

    for (const guest of guests) {
      const eventGuests = grouped.get(guest.event_id) ?? [];
      eventGuests.push(guest);
      grouped.set(guest.event_id, eventGuests);
    }

    return grouped;
  }, [guests]);

  return (
    <>
      <div className="flex flex-col gap-5">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            guests={guestsByEventId.get(event.id) ?? []}
          />
        ))}
      </div>

      <RsvpToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

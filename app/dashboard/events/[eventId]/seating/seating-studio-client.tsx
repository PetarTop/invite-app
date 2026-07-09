"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  RsvpToastStack,
  useRsvpToasts,
} from "@/app/dashboard/components/rsvp-toast-stack";
import {
  seatingGoingToastContent,
  toGoingGuests,
  type GuestRealtimeRow,
} from "@/lib/guest-realtime";
import { useGuestRealtime } from "@/lib/hooks/use-guest-realtime";
import { calculateRsvpStats, isGoingGuest } from "@/lib/rsvp-stats";
import type { LayoutTable } from "@/lib/seating-layout";
import type { GoingGuest } from "@/lib/seating-guests";
import { sanitizeGoingGuestSeating } from "@/lib/seating-guests";

import { SeatingStudio } from "../../../seating/seating-studio";

type SeatingStudioClientProps = {
  eventId: string;
  eventName: string;
  tables: LayoutTable[];
  initialGuests: GuestRealtimeRow[];
};

export function SeatingStudioClient({
  eventId,
  eventName,
  tables,
  initialGuests,
}: SeatingStudioClientProps) {
  const { toasts, showToast, dismissToast } = useRsvpToasts();
  const notifiedGuestIdsRef = useRef(
    new Set(initialGuests.map((guest) => guest.id)),
  );

  useEffect(() => {
    for (const guest of initialGuests) {
      notifiedGuestIdsRef.current.add(guest.id);
    }
  }, [initialGuests]);

  const handleNewGoingGuest = useCallback(
    (guest: GuestRealtimeRow) => {
      if (!isGoingGuest(guest.status)) {
        return;
      }

      if (notifiedGuestIdsRef.current.has(guest.id)) {
        return;
      }

      notifiedGuestIdsRef.current.add(guest.id);

      const { title, message } = seatingGoingToastContent(guest.name);
      showToast({ title, message, variant: "seating" });
    },
    [showToast],
  );

  const { guests } = useGuestRealtime({
    eventIds: [eventId],
    initialGuests,
    onNewGoingGuest: handleNewGoingGuest,
  });

  const goingGuestsFromRealtime = useMemo(
    () => toGoingGuests(guests).map(sanitizeGoingGuestSeating),
    [guests],
  );

  const rsvpStats = useMemo(() => calculateRsvpStats(guests), [guests]);

  const [seatGuests, setSeatGuests] = useState<GoingGuest[]>(
    goingGuestsFromRealtime,
  );

  useEffect(() => {
    setSeatGuests(goingGuestsFromRealtime);
  }, [goingGuestsFromRealtime]);

  return (
    <>
      <SeatingStudio
        eventId={eventId}
        eventName={eventName}
        tables={tables}
        guests={seatGuests}
        rsvpStats={rsvpStats}
        onGuestsChange={setSeatGuests}
      />

      <RsvpToastStack
        toasts={toasts}
        onDismiss={dismissToast}
        position="top-right"
      />
    </>
  );
}

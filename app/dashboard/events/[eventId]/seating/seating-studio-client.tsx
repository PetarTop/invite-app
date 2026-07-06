"use client";

import { useEffect, useState } from "react";

import type { RsvpStats } from "@/lib/rsvp-stats";
import type { LayoutTable } from "@/lib/seating-layout";
import type { GoingGuest } from "@/lib/seating-guests";

import { SeatingStudio } from "../../../seating/seating-studio";

type SeatingStudioClientProps = {
  eventId: string;
  eventName: string;
  tables: LayoutTable[];
  goingGuests: GoingGuest[];
  rsvpStats: RsvpStats;
};

export function SeatingStudioClient({
  eventId,
  eventName,
  tables,
  goingGuests,
  rsvpStats,
}: SeatingStudioClientProps) {
  const [guests, setGuests] = useState(goingGuests);

  useEffect(() => {
    setGuests(goingGuests);
  }, [goingGuests]);

  return (
    <SeatingStudio
      eventId={eventId}
      eventName={eventName}
      tables={tables}
      guests={guests}
      rsvpStats={rsvpStats}
      onGuestsChange={setGuests}
    />
  );
}

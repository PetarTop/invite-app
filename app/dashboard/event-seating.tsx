"use client";

import { useEffect, useState } from "react";

import type { LayoutTable } from "@/lib/seating-layout";
import type { GoingGuest } from "@/lib/seating-guests";

import { SeatingPlanEditor } from "./seating/seating-plan-editor";

export type SeatingTable = LayoutTable;
export type { GoingGuest };

type EventSeatingProps = {
  eventId: string;
  tables: SeatingTable[];
  goingGuests: GoingGuest[];
};

export function EventSeating({
  eventId,
  tables,
  goingGuests,
}: EventSeatingProps) {
  const [guests, setGuests] = useState(goingGuests);

  useEffect(() => {
    setGuests(goingGuests);
  }, [goingGuests]);

  return (
    <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <SeatingPlanEditor
        eventId={eventId}
        tables={tables}
        guests={guests}
        onGuestsChange={setGuests}
      />
    </div>
  );
}

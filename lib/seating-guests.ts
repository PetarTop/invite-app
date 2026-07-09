export type GoingGuest = {
  id: string;
  event_id: string;
  name: string;
  table_id: string | null;
  seat_index: number | null;
};

export function isGuestSeatedOnChair(guest: GoingGuest) {
  return guest.table_id !== null && guest.seat_index !== null;
}

export function isGuestUnassignedForCanvas(guest: GoingGuest) {
  return guest.table_id === null && guest.seat_index === null;
}

/** Clears partial or stale seating assignments (e.g. table_id null but seat_index set). */
export function sanitizeGoingGuestSeating(guest: GoingGuest): GoingGuest {
  if (guest.table_id === null || guest.seat_index === null) {
    return {
      ...guest,
      table_id: null,
      seat_index: null,
    };
  }

  return guest;
}

/** Guests assigned to a deleted or missing table are treated as unassigned in the UI. */
export function normalizeGuestsForTables(
  guests: GoingGuest[],
  tableIds: Set<string>,
): GoingGuest[] {
  return guests.map((guest) => {
    const sanitized = sanitizeGoingGuestSeating(guest);

    if (
      sanitized.table_id !== null &&
      !tableIds.has(sanitized.table_id)
    ) {
      return {
        ...sanitized,
        table_id: null,
        seat_index: null,
      };
    }

    return sanitized;
  });
}

export function seatKey(tableId: string, seatIndex: number) {
  return `${tableId}-${seatIndex}`;
}

export function buildGuestsBySeat(guests: GoingGuest[]) {
  const map = new Map<string, GoingGuest>();

  for (const guest of guests) {
    if (guest.table_id !== null && guest.seat_index !== null) {
      map.set(seatKey(guest.table_id, guest.seat_index), guest);
    }
  }

  return map;
}

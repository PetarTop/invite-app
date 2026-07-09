import { isGoingGuest, normalizeGuestStatus } from "@/lib/rsvp-stats";
import type { GoingGuest } from "@/lib/seating-guests";

export type GuestRealtimeRow = {
  id: string;
  event_id: string;
  name: string;
  status: string | null;
  table_id: string | null;
  seat_index: number | null;
};

export type GuestRealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

/**
 * Enable Realtime for public.guests in Supabase if subscriptions do not fire:
 * Dashboard → Database → Replication → supabase_realtime → enable `guests`
 * Or SQL: `alter publication supabase_realtime add table public.guests;`
 */
export const GUEST_REALTIME_SETUP_NOTE =
  "Enable Realtime for public.guests in Supabase (Database → Replication → supabase_realtime).";

export function isDeclinedGuest(status: string | null): boolean {
  const normalized = normalizeGuestStatus(status);
  return (
    normalized === "not_going" ||
    normalized === "not-going" ||
    normalized === "no" ||
    normalized === "declined"
  );
}

export function normalizeGuestRow(row: {
  id: string | number;
  event_id: string | number;
  name: string;
  status?: string | null;
  table_id?: string | number | null;
  seat_index?: number | null;
}): GuestRealtimeRow {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    name: row.name,
    status: row.status ?? null,
    table_id: row.table_id != null ? String(row.table_id) : null,
    seat_index: row.seat_index != null ? Number(row.seat_index) : null,
  };
}

export function toGoingGuest(row: GuestRealtimeRow): GoingGuest | null {
  if (!isGoingGuest(row.status)) {
    return null;
  }

  return {
    id: row.id,
    event_id: row.event_id,
    name: row.name,
    table_id: row.table_id,
    seat_index: row.seat_index,
  };
}

export function toGoingGuests(rows: GuestRealtimeRow[]): GoingGuest[] {
  const guests: GoingGuest[] = [];

  for (const row of rows) {
    const going = toGoingGuest(row);
    if (going) {
      guests.push(going);
    }
  }

  return guests;
}

export function isUnassignedGoingGuest(row: GuestRealtimeRow): boolean {
  return (
    isGoingGuest(row.status) &&
    row.table_id === null &&
    row.seat_index === null
  );
}

export function seatingGoingToastContent(name: string) {
  return {
    title: "Novi gost se prijavio",
    message: `${name} je dodat u listu gostiju.`,
  };
}

/** @deprecated Use seatingGoingToastContent */
export function seatingUnassignedToastContent(name: string) {
  return seatingGoingToastContent(name);
}

export function shouldNotifyNewGoingGuest(
  eventType: GuestRealtimeEvent,
  previous: GuestRealtimeRow | undefined,
  next: GuestRealtimeRow,
  alreadyExists: boolean,
): boolean {
  if (!isGoingGuest(next.status)) {
    return false;
  }

  if (eventType === "INSERT") {
    return !alreadyExists;
  }

  if (eventType === "UPDATE") {
    if (!previous) {
      return false;
    }

    return !isGoingGuest(previous.status);
  }

  return false;
}

/** @deprecated Use shouldNotifyNewGoingGuest */
export function shouldNotifySeatingUnassignedGuest(
  eventType: GuestRealtimeEvent,
  previous: GuestRealtimeRow | undefined,
  next: GuestRealtimeRow,
  alreadyExists: boolean,
): boolean {
  if (!isUnassignedGoingGuest(next)) {
    return false;
  }

  return shouldNotifyNewGoingGuest(eventType, previous, next, alreadyExists);
}

export function rsvpToastMessage(
  name: string,
  status: string | null,
  event: GuestRealtimeEvent,
): string | null {
  if (event === "DELETE") {
    return null;
  }

  if (event === "INSERT") {
    if (isGoingGuest(status)) {
      return `New RSVP: ${name} is going`;
    }
    if (isDeclinedGuest(status)) {
      return `New RSVP: ${name} declined`;
    }
    return `New RSVP: ${name} responded`;
  }

  return null;
}

export function applyGuestInsert(
  guests: GuestRealtimeRow[],
  row: GuestRealtimeRow,
): GuestRealtimeRow[] {
  if (guests.some((guest) => guest.id === row.id)) {
    return guests;
  }

  return [...guests, row];
}

export function applyGuestUpdate(
  guests: GuestRealtimeRow[],
  row: GuestRealtimeRow,
): GuestRealtimeRow[] {
  const index = guests.findIndex((guest) => guest.id === row.id);

  if (index === -1) {
    return applyGuestInsert(guests, row);
  }

  const next = [...guests];
  next[index] = row;
  return next;
}

export function applyGuestDelete(
  guests: GuestRealtimeRow[],
  guestId: string,
): GuestRealtimeRow[] {
  return guests.filter((guest) => guest.id !== guestId);
}

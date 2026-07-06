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
  return guest.seat_index === null;
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

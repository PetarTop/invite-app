export type ChairDropData = {
  type: "chair";
  tableId: string;
  seatIndex: number;
};

export function guestDragId(eventId: string, guestId: string) {
  return `guest-${eventId}-${guestId}`;
}

export function chairDropId(tableId: string, seatIndex: number) {
  return `chair:${tableId}:${seatIndex}`;
}

export function unassignedZoneId(eventId: string) {
  return `unassigned-${eventId}`;
}

export function isGuestDragId(id: string) {
  return id.startsWith("guest-");
}

export function isLayoutTableDragId(id: string) {
  return id.startsWith("layout-table-");
}

export function isChairDropId(id: string) {
  return id.startsWith("chair:");
}

export function parseGuestDragId(id: string) {
  const parts = id.split("-");
  return parts[parts.length - 1] ?? "";
}

export function parseChairDropId(id: string): {
  tableId: string;
  seatIndex: number;
} | null {
  const match = id.match(/^chair:([^:]+):(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    tableId: match[1],
    seatIndex: Number(match[2]),
  };
}

export function parseChairDropData(
  data: unknown,
): { tableId: string; seatIndex: number } | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Partial<ChairDropData>;
  if (record.type !== "chair") {
    return null;
  }

  if (record.tableId == null || record.seatIndex == null) {
    return null;
  }

  if (!Number.isInteger(record.seatIndex)) {
    return null;
  }

  return {
    tableId: String(record.tableId),
    seatIndex: record.seatIndex,
  };
}

export function chairDropData(
  tableId: string,
  seatIndex: number,
): ChairDropData {
  return {
    type: "chair",
    tableId: String(tableId),
    seatIndex,
  };
}

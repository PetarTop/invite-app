/** Temporary debug flag — set false or remove when seating DnD is stable. */
export const SEAT_DND_DEBUG = false;

export function logSeatDnd(
  phase: string,
  payload: Record<string, unknown>,
) {
  if (!SEAT_DND_DEBUG || typeof window === "undefined") {
    return;
  }

  console.log(`[seat-dnd] ${phase}`, payload);
}

export function parseDropTarget(overId: string | null | undefined) {
  if (!overId) {
    return { kind: "none" as const };
  }

  if (overId.startsWith("chair:")) {
    const match = overId.match(/^chair:([^:]+):(\d+)$/);
    if (match) {
      return {
        kind: "chair" as const,
        tableId: match[1],
        seatIndex: Number(match[2]),
      };
    }
    return { kind: "chair-unparsed" as const, overId };
  }

  if (overId.startsWith("unassigned-")) {
    return { kind: "unassigned" as const, overId };
  }

  if (overId.startsWith("guest-")) {
    return { kind: "guest-draggable" as const, overId };
  }

  if (overId.startsWith("layout-table-")) {
    return { kind: "table-draggable" as const, overId };
  }

  return { kind: "unknown" as const, overId };
}

type GuestStatus = {
  status: string | null;
};

export type RsvpStats = {
  going: number;
  not_going: number;
  pending: number;
};

export function normalizeGuestStatus(status: string | null): string {
  return (status ?? "").trim().toLowerCase().replace(/\s+/g, "_");
}

export function calculateRsvpStats(guests: GuestStatus[] | null): RsvpStats {
  const stats: RsvpStats = { going: 0, not_going: 0, pending: 0 };

  for (const guest of guests ?? []) {
    const status = normalizeGuestStatus(guest.status);

    if (status === "going" || status === "yes" || status === "attending") {
      stats.going++;
    } else if (
      status === "not_going" ||
      status === "not-going" ||
      status === "no" ||
      status === "declined"
    ) {
      stats.not_going++;
    } else {
      stats.pending++;
    }
  }

  return stats;
}

export function isGoingGuest(status: string | null): boolean {
  const normalized = normalizeGuestStatus(status);
  return (
    normalized === "going" ||
    normalized === "yes" ||
    normalized === "attending"
  );
}

export function groupGuestsByEventId(
  guests: { event_id: string | number; status: string | null }[],
): Map<string, GuestStatus[]> {
  const grouped = new Map<string, GuestStatus[]>();

  for (const guest of guests) {
    const eventId = String(guest.event_id);
    const eventGuests = grouped.get(eventId) ?? [];
    eventGuests.push({ status: guest.status });
    grouped.set(eventId, eventGuests);
  }

  return grouped;
}

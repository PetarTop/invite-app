import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { isGoingGuest } from "@/lib/rsvp-stats";
import { calculateRsvpStats } from "@/lib/rsvp-stats";
import { normalizeLayoutTable, type LayoutTable } from "@/lib/seating-layout";
import type { GoingGuest } from "@/lib/seating-guests";
import { getDashboardClient } from "@/lib/supabase/dashboard";

export type SeatingStudioEvent = {
  id: string;
  name: string;
  slug: string;
};

export type SeatingStudioData = {
  event: SeatingStudioEvent;
  tables: LayoutTable[];
  goingGuests: GoingGuest[];
  rsvpStats: ReturnType<typeof calculateRsvpStats>;
};

async function fetchGuestsForEvent(
  supabase: Awaited<ReturnType<typeof getDashboardClient>>,
  eventId: number,
) {
  const withSeat = await supabase
    .from("guests")
    .select("id, event_id, name, status, table_id, seat_index")
    .eq("event_id", eventId);

  if (
    withSeat.error?.message.includes("seat_index") &&
    withSeat.error.message.includes("does not exist")
  ) {
    const fallback = await supabase
      .from("guests")
      .select("id, event_id, name, status, table_id")
      .eq("event_id", eventId);

    return {
      data:
        fallback.data?.map((guest) => ({ ...guest, seat_index: null })) ?? [],
      error: fallback.error,
    };
  }

  if (
    withSeat.error?.message.includes("table_id") &&
    withSeat.error.message.includes("does not exist")
  ) {
    const fallback = await supabase
      .from("guests")
      .select("id, event_id, name, status")
      .eq("event_id", eventId);

    return {
      data:
        fallback.data?.map((guest) => ({
          ...guest,
          table_id: null,
          seat_index: null,
        })) ?? [],
      error: fallback.error,
    };
  }

  return { data: withSeat.data ?? [], error: withSeat.error };
}

export async function loadSeatingStudioData(
  eventId: string,
): Promise<SeatingStudioData> {
  const user = await requireUser();
  const supabase = await getDashboardClient();
  const numericEventId = Number(eventId);

  if (!Number.isFinite(numericEventId)) {
    notFound();
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, slug")
    .eq("id", numericEventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (eventError || !event) {
    notFound();
  }

  const [guestsResult, tablesResult] = await Promise.all([
    fetchGuestsForEvent(supabase, numericEventId),
    supabase
      .from("tables")
      .select(
        "id, event_id, name, capacity, shape, x, y, width, height, rotation",
      )
      .eq("event_id", numericEventId),
  ]);

  if (guestsResult.error) {
    throw new Error(guestsResult.error.message);
  }

  if (tablesResult.error) {
    throw new Error(tablesResult.error.message);
  }

  const allGuests = guestsResult.data ?? [];
  const goingGuests: GoingGuest[] = [];

  for (const guest of allGuests) {
    if (!isGoingGuest(guest.status)) {
      continue;
    }

    goingGuests.push({
      id: String(guest.id),
      event_id: String(guest.event_id),
      name: guest.name,
      table_id: guest.table_id != null ? String(guest.table_id) : null,
      seat_index:
        guest.seat_index != null ? Number(guest.seat_index) : null,
    });
  }

  return {
    event: {
      id: String(event.id),
      name: event.name,
      slug: event.slug,
    },
    tables: (tablesResult.data ?? []).map(normalizeLayoutTable),
    goingGuests,
    rsvpStats: calculateRsvpStats(allGuests),
  };
}

import { normalizeGuestRow } from "@/lib/guest-realtime";
import { requireUser } from "@/lib/auth";
import { listOwnedEventsWithPackage } from "@/lib/seating-access";
import { getDashboardClient } from "@/lib/supabase/dashboard";

import { DashboardEventsList } from "./dashboard-events-list";
import { SignOutButton } from "./sign-out-button";
import { dashboardContainer, dashboardShell } from "./dashboard-ui";

type GuestRow = {
  id: string | number;
  event_id: string | number;
  name: string;
  status: string | null;
  table_id?: string | number | null;
  seat_index?: number | null;
};

async function fetchGuests(
  supabase: Awaited<ReturnType<typeof getDashboardClient>>,
  eventIds: number[],
) {
  if (eventIds.length === 0) {
    return { data: [], error: null };
  }

  const withTableId = await supabase
    .from("guests")
    .select("id, event_id, name, status, table_id, seat_index")
    .in("event_id", eventIds);

  if (
    withTableId.error?.message.includes("table_id") &&
    withTableId.error.message.includes("does not exist")
  ) {
    const withoutTableId = await supabase
      .from("guests")
      .select("id, event_id, name, status")
      .in("event_id", eventIds);

    return {
      data:
        withoutTableId.data?.map((guest) => ({
          ...guest,
          table_id: null,
          seat_index: null,
        })) ?? [],
      error: withoutTableId.error,
    };
  }

  if (
    withTableId.error?.message.includes("seat_index") &&
    withTableId.error.message.includes("does not exist")
  ) {
    const withoutSeatIndex = await supabase
      .from("guests")
      .select("id, event_id, name, status, table_id")
      .in("event_id", eventIds);

    return {
      data:
        withoutSeatIndex.data?.map((guest) => ({
          ...guest,
          seat_index: null,
        })) ?? [],
      error: withoutSeatIndex.error,
    };
  }

  return {
    data: withTableId.data as GuestRow[] | null,
    error: withTableId.error,
  };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await getDashboardClient();

  let events: Awaited<ReturnType<typeof listOwnedEventsWithPackage>> = [];
  let eventsError: { message: string } | null = null;

  try {
    events = await listOwnedEventsWithPackage(user.id);
  } catch (error) {
    eventsError =
      error instanceof Error ? error : { message: "Failed to load events." };
  }

  let guestsError: { message: string } | null = null;
  let allGuestRows: ReturnType<typeof normalizeGuestRow>[] = [];

  if (events.length > 0) {
    const eventIds = events.map((event) => Number(event.id));
    const guestsResult = await fetchGuests(supabase, eventIds);

    guestsError = guestsResult.error;
    allGuestRows = (guestsResult.data ?? []).map(normalizeGuestRow);
  }

  const error = eventsError ?? guestsError;

  return (
    <div className={dashboardShell}>
      <div className={dashboardContainer}>
        <header className="flex flex-col gap-6 border-b border-zinc-800/80 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-amber-200/60">
              Invite
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
              Dobrodošli u vaš panel za organizaciju događaja.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Ovde možete pratiti potvrde dolaska gostiju i upravljati
              organizacijom vašeg događaja.
            </p>
            {user.email && (
              <p className="mt-4 text-xs text-zinc-500">{user.email}</p>
            )}
          </div>
          <SignOutButton />
        </header>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-100">
            Vaši događaji
          </h2>

          {error ? (
            <p
              className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              Nije moguće učitati podatke: {error.message}
            </p>
          ) : events.length > 0 ? (
            <div className="mt-5">
              <DashboardEventsList
                events={events}
                initialGuests={allGuestRows}
              />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center">
              <p className="text-sm font-medium text-zinc-300">
                Trenutno nemate dodijeljenih događaja.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Kada vam dodijelimo događaj, pojaviće se ovdje.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

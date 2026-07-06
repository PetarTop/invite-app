import {
  calculateRsvpStats,
  groupGuestsByEventId,
  isGoingGuest,
} from "@/lib/rsvp-stats";
import { requireUser } from "@/lib/auth";
import { getDashboardClient } from "@/lib/supabase/dashboard";

import { CreateEventForm } from "./create-event-form";
import { EventSeating, type GoingGuest } from "./event-seating";
import { SignOutButton } from "./sign-out-button";
import { normalizeLayoutTable, type LayoutTable } from "@/lib/seating-layout";

const GUESTS_SELECT_POLICY_SQL = `grant usage on schema public to anon, authenticated;
grant select, update on table public.guests to anon, authenticated;

alter table public.guests enable row level security;

drop policy if exists "guests_select_public" on public.guests;
drop policy if exists "guests_update_public" on public.guests;

create policy "guests_select_public"
on public.guests for select to anon, authenticated using (true);

create policy "guests_update_public"
on public.guests for update to anon, authenticated using (true) with check (true);`;

const TABLES_UUID_FIX_SQL = `-- events.id is a number (e.g. 2), not uuid.
-- Run this in Supabase SQL Editor:

alter table public.guests drop constraint if exists guests_table_id_fkey;
drop table if exists public.tables cascade;

create table public.tables (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events (id) on delete cascade,
  name text not null,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

alter table public.guests drop column if exists table_id;
alter table public.guests
  add column table_id bigint references public.tables (id) on delete set null;`;

const TABLES_POLICY_SQL = `grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.tables to anon, authenticated;

alter table public.tables enable row level security;

drop policy if exists "tables_select_public" on public.tables;
drop policy if exists "tables_insert_public" on public.tables;
drop policy if exists "tables_update_public" on public.tables;
drop policy if exists "tables_delete_public" on public.tables;

create policy "tables_select_public"
on public.tables for select to anon, authenticated using (true);

create policy "tables_insert_public"
on public.tables for insert to anon, authenticated with check (true);

create policy "tables_update_public"
on public.tables for update to anon, authenticated using (true) with check (true);

create policy "tables_delete_public"
on public.tables for delete to anon, authenticated using (true);`;

const TABLE_ID_FIX_SQL = `alter table public.guests
  add column if not exists table_id bigint;

alter table public.guests
  drop constraint if exists guests_table_id_fkey;

alter table public.guests
  add constraint guests_table_id_fkey
  foreign key (table_id) references public.tables (id) on delete set null;`;

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
    return { data: [], error: null, missingTableIdColumn: false };
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
      data: withoutTableId.data?.map((guest) => ({
        ...guest,
        table_id: null,
        seat_index: null,
      })),
      error: withoutTableId.error,
      missingTableIdColumn: true,
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
      data: withoutSeatIndex.data?.map((guest) => ({
        ...guest,
        seat_index: null,
      })),
      error: withoutSeatIndex.error,
      missingTableIdColumn: false,
    };
  }

  return {
    data: withTableId.data,
    error: withTableId.error,
    missingTableIdColumn: false,
  };
}

type EventRow = {
  id: string;
  name: string;
  slug: string;
};

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await getDashboardClient();

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, name, slug")
    .eq("user_id", user.id)
    .order("name");

  let guestsError: { message: string } | null = null;
  let tablesError: { message: string } | null = null;
  let missingTableIdColumn = false;
  let guestsByEventId = new Map<string, { status: string | null }[]>();
  let goingGuestsByEventId = new Map<string, GoingGuest[]>();
  let tablesByEventId = new Map<string, LayoutTable[]>();
  let totalGuests = 0;

  if (events && events.length > 0) {
    const eventIds = events.map((event) => Number(event.id));

    const [guestsResult, tablesResult] = await Promise.all([
      fetchGuests(supabase, eventIds),
      supabase
        .from("tables")
        .select(
          "id, event_id, name, capacity, shape, x, y, width, height, rotation",
        )
        .in("event_id", eventIds),
    ]);

    guestsError = guestsResult.error;
    tablesError = tablesResult.error;
    missingTableIdColumn = guestsResult.missingTableIdColumn;

    const matchingGuests = guestsResult.data ?? [];

    totalGuests = matchingGuests.length;
    guestsByEventId = groupGuestsByEventId(matchingGuests);

    for (const guest of matchingGuests as GuestRow[]) {
      if (!isGoingGuest(guest.status)) {
        continue;
      }

      const eventId = String(guest.event_id);
      const goingGuests = goingGuestsByEventId.get(eventId) ?? [];
      goingGuests.push({
        id: String(guest.id),
        event_id: eventId,
        name: guest.name,
        table_id: guest.table_id != null ? String(guest.table_id) : null,
        seat_index:
          guest.seat_index != null ? Number(guest.seat_index) : null,
      });
      goingGuestsByEventId.set(eventId, goingGuests);
    }

    for (const table of tablesResult.data ?? []) {
      const eventId = String(table.event_id);

      const eventTables = tablesByEventId.get(eventId) ?? [];
      eventTables.push(normalizeLayoutTable(table));
      tablesByEventId.set(eventId, eventTables);
    }
  }

  const error = eventsError ?? guestsError;
  const showTablesPermissionHint =
    tablesError?.message.includes("permission denied") ?? false;
  const showGuestsPermissionHint =
    !error && (events?.length ?? 0) > 0 && totalGuests === 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create and manage wedding invitation events.
          </p>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
        <SignOutButton />
      </header>

      {showTablesPermissionHint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium">
            Seating ne radi jer app ne može čitati tablicu tables.
          </p>
          <p className="mt-2">
            U Supabase SQL Editoru pokreni ovo:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-amber-100 p-3 font-mono text-xs text-amber-950 dark:bg-amber-900 dark:text-amber-50">
            {TABLES_POLICY_SQL}
          </pre>
        </div>
      )}

      {missingTableIdColumn && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium">
            Seating ne radi jer u tablici guests nedostaje stupac table_id.
          </p>
          <p className="mt-2">
            U Supabase SQL Editoru pokreni ovo (nakon što postoji tablica tables):
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-amber-100 p-3 font-mono text-xs text-amber-950 dark:bg-amber-900 dark:text-amber-50">
            {TABLE_ID_FIX_SQL}
          </pre>
        </div>
      )}

      {showGuestsPermissionHint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-medium">
            RSVP statistika je 0 jer app ne može čitati guests tablicu.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-md bg-amber-100 p-3 font-mono text-xs text-amber-950 dark:bg-amber-900 dark:text-amber-50">
            {GUESTS_SELECT_POLICY_SQL}
          </pre>
        </div>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">New event</h2>
        <CreateEventForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Your events</h2>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            Failed to load events: {error.message}
          </p>
        ) : events && events.length > 0 ? (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {(events as EventRow[]).map((event) => {
              const eventId = String(event.id);
              const stats = calculateRsvpStats(
                guestsByEventId.get(eventId) ?? null,
              );

              return (
                <li key={event.id} className="px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{event.name}</span>
                      <code className="w-fit rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                        {event.slug}
                      </code>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-green-100 px-2.5 py-1 font-medium text-green-800 dark:bg-green-950 dark:text-green-200">
                        Going: {stats.going}
                      </span>
                      <span className="rounded-full bg-red-100 px-2.5 py-1 font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
                        Not going: {stats.not_going}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        Pending: {stats.pending}
                      </span>
                    </div>
                  </div>

                  <EventSeating
                    eventId={eventId}
                    tables={tablesByEventId.get(eventId) ?? []}
                    goingGuests={goingGuestsByEventId.get(eventId) ?? []}
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            No events yet. Create your first one above.
          </p>
        )}
      </section>
    </div>
  );
}

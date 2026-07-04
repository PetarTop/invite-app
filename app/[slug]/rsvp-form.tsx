"use client";

import { useActionState } from "react";

import { submitRsvp, type RsvpState } from "./actions";

const GUESTS_INSERT_POLICY_SQL = `grant usage on schema public to anon, authenticated;
grant select, insert on table public.guests to anon, authenticated;

alter table public.guests enable row level security;

drop policy if exists "guests_insert_public" on public.guests;

create policy "guests_insert_public"
on public.guests
for insert
to anon, authenticated
with check (true);`;

const initialState: RsvpState = {};

type RsvpFormProps = {
  eventId: string;
  slug: string;
};

export function RsvpForm({ eventId, slug }: RsvpFormProps) {
  const [state, formAction, pending] = useActionState(submitRsvp, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="guest-name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Your name
        </label>
        <input
          id="guest-name"
          name="name"
          type="text"
          required
          placeholder="Your full name"
          disabled={state.success}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:opacity-60 dark:border-zinc-700 dark:bg-black dark:text-zinc-100"
        />
      </div>

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <p>{state.error}</p>
          {state.error.includes("permission denied") && (
            <div className="mt-3 space-y-2 text-xs text-red-900 dark:text-red-100">
              <p>
                U Supabase dashboardu otvori <strong>SQL Editor</strong>,
                zalijepi ovo i klikni <strong>Run</strong>:
              </p>
              <pre className="overflow-x-auto rounded-md bg-red-100 p-2 font-mono text-[11px] text-red-950 dark:bg-red-900 dark:text-red-50">
                {GUESTS_INSERT_POLICY_SQL}
              </pre>
            </div>
          )}
        </div>
      )}

      {state.success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
          Thank you! Your RSVP has been recorded.
        </p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            name="status"
            value="going"
            disabled={pending}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {pending ? "Saving..." : "Going"}
          </button>
          <button
            type="submit"
            name="status"
            value="not_going"
            disabled={pending}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            {pending ? "Saving..." : "Not going"}
          </button>
        </div>
      )}
    </form>
  );
}

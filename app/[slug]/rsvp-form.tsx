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

function successMessage(status: RsvpState["status"]) {
  if (status === "not_going") {
    return "Hvala na odgovoru.";
  }

  return "Hvala! Vaš dolazak je potvrđen.";
}

export function RsvpForm({ eventId, slug }: RsvpFormProps) {
  const [state, formAction, pending] = useActionState(submitRsvp, initialState);

  if (state.success) {
    return (
      <div
        className="rsvp-success-enter rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-8 text-center"
        role="status"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
          ✓
        </div>
        <p className="mt-4 font-[family-name:var(--font-invite-display)] text-2xl text-emerald-100">
          {successMessage(state.status)}
        </p>
        <p className="mt-2 text-sm text-emerald-200/70">
          Vaš odgovor je uspješno zaprimljen.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-stone-800/80 bg-stone-950/50 p-5 sm:p-6"
    >
      <input type="hidden" name="event_id" value={eventId} />
      <input type="hidden" name="slug" value={slug} />

      <div className="flex flex-col gap-2">
        <label
          htmlFor="guest-name"
          className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400"
        >
          Ime i prezime
        </label>
        <input
          id="guest-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Vaše ime i prezime"
          disabled={pending}
          className="h-12 w-full rounded-xl border border-stone-700/80 bg-stone-900/80 px-4 text-base text-stone-100 outline-none transition-colors placeholder:text-stone-600 focus:border-amber-200/40 focus:ring-2 focus:ring-amber-200/15 disabled:opacity-60"
        />
      </div>

      {state.error && (
        <div
          className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          role="alert"
        >
          <p>{state.error}</p>
          {state.error.includes("permission denied") && (
            <div className="mt-3 space-y-2 text-xs text-red-100/90">
              <p>
                U Supabase dashboardu otvori <strong>SQL Editor</strong>,
                zalijepi ovo i klikni <strong>Run</strong>:
              </p>
              <pre className="overflow-x-auto rounded-md bg-red-950/50 p-2 font-mono text-[11px]">
                {GUESTS_INSERT_POLICY_SQL}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          name="status"
          value="going"
          disabled={pending}
          className="inline-flex h-12 min-h-12 flex-1 items-center justify-center rounded-xl bg-gradient-to-b from-amber-200 to-amber-300 px-5 text-base font-semibold text-stone-900 shadow-lg shadow-amber-950/30 transition-all hover:from-amber-100 hover:to-amber-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Šaljem…" : "Dolazim"}
        </button>
        <button
          type="submit"
          name="status"
          value="not_going"
          disabled={pending}
          className="inline-flex h-12 min-h-12 flex-1 items-center justify-center rounded-xl border border-stone-600/80 bg-stone-900/60 px-5 text-base font-medium text-stone-200 transition-all hover:border-stone-500 hover:bg-stone-800/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Šaljem…" : "Ne dolazim"}
        </button>
      </div>
    </form>
  );
}

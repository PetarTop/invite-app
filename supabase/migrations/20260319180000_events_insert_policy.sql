-- Allow insert access to events for the app (anon + authenticated).

grant insert on table public.events to anon, authenticated;

drop policy if exists "events_insert_public" on public.events;

create policy "events_insert_public"
on public.events
for insert
to anon, authenticated
with check (true);

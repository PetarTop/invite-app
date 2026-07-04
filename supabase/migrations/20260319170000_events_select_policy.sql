-- Allow read access to events for the app (anon + authenticated).
-- Run in Supabase SQL Editor if not using Supabase CLI migrations.

grant usage on schema public to anon, authenticated;
grant select on table public.events to anon, authenticated;

alter table public.events enable row level security;

drop policy if exists "events_select_public" on public.events;

create policy "events_select_public"
on public.events
for select
to anon, authenticated
using (true);

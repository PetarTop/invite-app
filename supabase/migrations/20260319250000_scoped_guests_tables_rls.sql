-- Scope guests and tables to the authenticated user's events on the dashboard.
-- Public RSVP (anon) keeps existing insert/select policies.

drop policy if exists "guests_select_own_events" on public.guests;
drop policy if exists "guests_update_own_events" on public.guests;
drop policy if exists "tables_select_own_events" on public.tables;
drop policy if exists "tables_insert_own_events" on public.tables;
drop policy if exists "tables_update_own_events" on public.tables;
drop policy if exists "tables_delete_own_events" on public.tables;

create policy "guests_select_own_events"
on public.guests
for select
to authenticated
using (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
);

create policy "guests_update_own_events"
on public.guests
for update
to authenticated
using (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
)
with check (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
);

create policy "tables_select_own_events"
on public.tables
for select
to authenticated
using (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
);

create policy "tables_insert_own_events"
on public.tables
for insert
to authenticated
with check (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
);

create policy "tables_update_own_events"
on public.tables
for update
to authenticated
using (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
)
with check (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
);

create policy "tables_delete_own_events"
on public.tables
for delete
to authenticated
using (
  event_id in (
    select id from public.events where user_id = auth.uid()
  )
);

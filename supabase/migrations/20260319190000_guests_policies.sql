-- Allow RSVP submissions into guests table.

grant usage on schema public to anon, authenticated;
grant select, insert on table public.guests to anon, authenticated;

alter table public.guests enable row level security;

drop policy if exists "guests_select_public" on public.guests;
drop policy if exists "guests_insert_public" on public.guests;

create policy "guests_select_public"
on public.guests
for select
to anon, authenticated
using (true);

create policy "guests_insert_public"
on public.guests
for insert
to anon, authenticated
with check (true);

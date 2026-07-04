-- Tables for seating + guest assignment via guests.table_id
-- Uses bigint IDs to match integer/bigserial events.id

create table if not exists public.tables (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events (id) on delete cascade,
  name text not null,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

alter table public.guests
  add column if not exists table_id bigint references public.tables (id) on delete set null;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.tables to anon, authenticated;
grant update on table public.guests to anon, authenticated;

alter table public.tables enable row level security;

drop policy if exists "tables_select_public" on public.tables;
drop policy if exists "tables_insert_public" on public.tables;
drop policy if exists "tables_update_public" on public.tables;
drop policy if exists "tables_delete_public" on public.tables;

create policy "tables_select_public"
on public.tables
for select
to anon, authenticated
using (true);

create policy "tables_insert_public"
on public.tables
for insert
to anon, authenticated
with check (true);

create policy "tables_update_public"
on public.tables
for update
to anon, authenticated
using (true)
with check (true);

create policy "tables_delete_public"
on public.tables
for delete
to anon, authenticated
using (true);

drop policy if exists "guests_update_public" on public.guests;

create policy "guests_update_public"
on public.guests
for update
to anon, authenticated
using (true)
with check (true);

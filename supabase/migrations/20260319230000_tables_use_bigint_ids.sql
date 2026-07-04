-- Fix: events.id is bigint/integer, not uuid.
-- Run in Supabase SQL Editor if you get: invalid input syntax for type uuid: "2"

alter table public.guests
  drop constraint if exists guests_table_id_fkey;

drop table if exists public.tables cascade;

create table public.tables (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events (id) on delete cascade,
  name text not null,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

alter table public.guests
  drop column if exists table_id;

alter table public.guests
  add column table_id bigint references public.tables (id) on delete set null;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.tables to anon, authenticated;
grant update on table public.guests to anon, authenticated;

alter table public.tables enable row level security;

drop policy if exists "tables_select_public" on public.tables;
drop policy if exists "tables_insert_public" on public.tables;
drop policy if exists "tables_update_public" on public.tables;
drop policy if exists "tables_delete_public" on public.tables;
drop policy if exists "guests_update_public" on public.guests;

create policy "tables_select_public"
on public.tables for select to anon, authenticated using (true);

create policy "tables_insert_public"
on public.tables for insert to anon, authenticated with check (true);

create policy "tables_update_public"
on public.tables for update to anon, authenticated using (true) with check (true);

create policy "tables_delete_public"
on public.tables for delete to anon, authenticated using (true);

create policy "guests_update_public"
on public.guests for update to anon, authenticated using (true) with check (true);

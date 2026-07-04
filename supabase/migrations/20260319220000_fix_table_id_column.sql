-- Safe fix: add guests.table_id even if a previous migration partially failed.
-- Run this in Supabase SQL Editor.

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null,
  name text not null,
  capacity integer not null check (capacity > 0),
  created_at timestamptz not null default now()
);

do $$
begin
  alter table public.tables
    add constraint tables_event_id_fkey
    foreign key (event_id) references public.events (id) on delete cascade;
exception
  when duplicate_object then null;
end $$;

alter table public.guests
  add column if not exists table_id uuid;

do $$
begin
  alter table public.guests
    add constraint guests_table_id_fkey
    foreign key (table_id) references public.tables (id) on delete set null;
exception
  when duplicate_object then null;
end $$;

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

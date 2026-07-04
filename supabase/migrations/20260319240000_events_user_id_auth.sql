-- Link events to authenticated users (admin-created accounts in Supabase Auth).

alter table public.events
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists events_user_id_idx on public.events (user_id);

grant select, insert, update, delete on table public.events to authenticated;

drop policy if exists "events_insert_public" on public.events;
drop policy if exists "events_select_own" on public.events;
drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_delete_own" on public.events;

create policy "events_select_own"
on public.events
for select
to authenticated
using (auth.uid() = user_id);

create policy "events_insert_own"
on public.events
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "events_update_own"
on public.events
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "events_delete_own"
on public.events
for delete
to authenticated
using (auth.uid() = user_id);

-- Link guests to events so Supabase can resolve nested queries in the future.

do $$
begin
  alter table public.guests
    add constraint guests_event_id_fkey
    foreign key (event_id) references public.events (id) on delete cascade;
exception
  when duplicate_object then null;
end $$;

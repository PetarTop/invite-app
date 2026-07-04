-- Phase 1: visual seating plan layout columns on public.tables
-- Preserves all existing rows, guest.table_id assignments, and RLS policies.
-- No policy changes required: tables_*_own_events policies are row-scoped by event_id.

-- ---------------------------------------------------------------------------
-- 1. Add layout columns (nullable first so backfill can run safely)
-- ---------------------------------------------------------------------------

alter table public.tables
  add column if not exists shape text,
  add column if not exists x double precision,
  add column if not exists y double precision,
  add column if not exists width double precision,
  add column if not exists height double precision,
  add column if not exists rotation double precision;

-- ---------------------------------------------------------------------------
-- 2. Backfill existing tables with sensible canvas defaults
--    Stagger positions per event so tables do not stack on top of each other.
-- ---------------------------------------------------------------------------

with numbered as (
  select
    id,
    row_number() over (partition by event_id order by id) - 1 as idx
  from public.tables
)
update public.tables as t
set
  shape = coalesce(t.shape, 'round'),
  width = coalesce(t.width, 120),
  height = coalesce(t.height, 120),
  rotation = coalesce(t.rotation, 0),
  x = coalesce(
    t.x,
    40 + (n.idx % 4) * 180
  ),
  y = coalesce(
    t.y,
    40 + floor(n.idx / 4.0) * 180
  )
from numbered as n
where t.id = n.id;

-- ---------------------------------------------------------------------------
-- 3. Enforce NOT NULL, defaults, and validation for new / updated rows
-- ---------------------------------------------------------------------------

alter table public.tables
  alter column shape set default 'round',
  alter column x set default 40,
  alter column y set default 40,
  alter column width set default 120,
  alter column height set default 120,
  alter column rotation set default 0;

alter table public.tables
  alter column shape set not null,
  alter column x set not null,
  alter column y set not null,
  alter column width set not null,
  alter column height set not null,
  alter column rotation set not null;

alter table public.tables
  drop constraint if exists tables_shape_check;

alter table public.tables
  add constraint tables_shape_check
  check (shape in ('round', 'rectangle', 'square'));

alter table public.tables
  drop constraint if exists tables_width_positive_check;

alter table public.tables
  add constraint tables_width_positive_check
  check (width > 0);

alter table public.tables
  drop constraint if exists tables_height_positive_check;

alter table public.tables
  add constraint tables_height_positive_check
  check (height > 0);

-- rotation is stored in degrees; no range check so editors can use negative
-- values or values > 360 if needed for animation / normalization in the app.

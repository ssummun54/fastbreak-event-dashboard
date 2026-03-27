-- Add event end date/time support
alter table public.events
  add column if not exists ends_at timestamptz;

-- Backfill existing rows so we can enforce NOT NULL safely.
-- Defaulting to +1 hour preserves current start times while giving a valid range.
update public.events
set ends_at = starts_at + interval '1 hour'
where ends_at is null;

alter table public.events
  alter column ends_at set not null;

-- Ensure end is after start.
alter table public.events
  drop constraint if exists events_ends_at_after_starts_at;

alter table public.events
  add constraint events_ends_at_after_starts_at
  check (ends_at > starts_at);

create index if not exists idx_events_ends_at
  on public.events(ends_at desc);

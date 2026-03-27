-- Add richer venue detail fields without removing existing address column.
alter table public.venues
  add column if not exists street text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text,
  add column if not exists capacity integer,
  add column if not exists indoor boolean,
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists notes text;

alter table public.venues
  drop column if exists country;

update public.venues
set
  street = coalesce(street, ''),
  city = coalesce(city, ''),
  state = coalesce(state, ''),
  zip = coalesce(zip, '');

alter table public.venues
  alter column street set not null,
  alter column city set not null,
  alter column state set not null,
  alter column zip set not null;

alter table public.venues
  drop constraint if exists venues_capacity_nonnegative;

alter table public.venues
  add constraint venues_capacity_nonnegative
  check (capacity is null or capacity >= 0);

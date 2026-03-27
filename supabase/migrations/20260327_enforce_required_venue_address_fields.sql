-- Enforce required venue address parts and remove country field.
-- Safe to run even if the previous migration has already been applied.

alter table public.venues
  add column if not exists street text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists zip text;

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
  drop column if exists country;

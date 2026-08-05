-- The storefront has a "Certified pre-owned" section, but condition existed
-- only in the seed catalogue in code — the table had no such column, so a
-- product added through the admin could never appear there.
alter table public.products
  add column if not exists condition text not null default 'new';

-- Constrained rather than free text: the storefront switches on these exact
-- values, and a typo would silently drop a product out of its section.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_condition_check'
  ) then
    alter table public.products
      add constraint products_condition_check
      check (condition in ('new', 'certified-pre-owned'));
  end if;
end $$;

-- Being signed in is not the same as being allowed to edit the catalogue.
-- Writes are restricted to an explicit allow-list of staff emails.
create table if not exists public.staff (
  email      text primary key,
  role       text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;

-- Lives in `private`, not `public`: PostgREST exposes the public schema, so a
-- SECURITY DEFINER helper there would be callable at /rest/v1/rpc/is_staff.
-- SECURITY DEFINER so the check is not itself subject to RLS on staff, which
-- would recurse. search_path is pinned so the lookup cannot be hijacked.
create schema if not exists private;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.staff s
    where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function private.is_staff() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_staff() to authenticated;

-- Staff can see the staff list; nobody else can read it at all.
drop policy if exists "staff_self_read" on public.staff;
create policy "staff_self_read"
  on public.staff for select to authenticated
  using (private.is_staff());

drop policy if exists "products_staff_insert" on public.products;
create policy "products_staff_insert"
  on public.products for insert to authenticated
  with check (private.is_staff());

drop policy if exists "products_staff_update" on public.products;
create policy "products_staff_update"
  on public.products for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

drop policy if exists "products_staff_delete" on public.products;
create policy "products_staff_delete"
  on public.products for delete to authenticated
  using (private.is_staff());

drop policy if exists "site_settings_staff_update" on public.site_settings;
create policy "site_settings_staff_update"
  on public.site_settings for update to authenticated
  using (private.is_staff()) with check (private.is_staff());

-- Image uploads and deletions follow the same rule.
drop policy if exists "product_images_insert" on storage.objects;
create policy "product_images_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and private.is_staff());

drop policy if exists "product_images_delete" on storage.objects;
create policy "product_images_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and private.is_staff());

-- Grant access by adding a row here, then creating the matching auth user:
--   insert into public.staff (email, role) values ('someone@example.com', 'admin');
insert into public.staff (email, role)
values ('walterntechltd@gmail.com', 'admin')
on conflict (email) do nothing;

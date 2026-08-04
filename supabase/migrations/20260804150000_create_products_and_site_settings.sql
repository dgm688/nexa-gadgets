-- Catalogue table the admin dashboard writes to and the storefront reads.
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  brand             text,
  category          text not null,
  short_description text,
  description       text,
  price             numeric not null check (price >= 0),
  original_price    numeric check (original_price >= 0),
  images            text[] not null default '{}',
  specs             jsonb  not null default '[]'::jsonb,
  is_new            boolean not null default false,
  featured          boolean not null default false,
  in_stock          boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

alter table public.products enable row level security;

-- The storefront reads anonymously; writes are locked down in a later migration.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products for select
  using (true);

-- Single-row settings table. The WhatsApp migration updates id = 1, so the row
-- has to exist first or that UPDATE silently matches nothing.
create table if not exists public.site_settings (
  id              integer primary key,
  phone           text,
  whatsapp_number text,
  updated_at      timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

insert into public.site_settings (id, phone, whatsapp_number)
values (1, '+1 (888) 555-0142', '18885550142')
on conflict (id) do nothing;

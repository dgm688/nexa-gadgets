# Nexa Gadgets

A standalone rebuild of the Nexa Gadgets storefront (originally built on Lovable),
with the WhatsApp number change and the admin image uploader already applied.

## Running it

```bash
npm install
npm run dev
```

Opens on <http://localhost:4100>. No backend needed — the storefront serves the
seed catalogue in `src/lib/catalog.ts`.

| Script            | Does                       |
| ----------------- | -------------------------- |
| `npm run dev`     | Vite dev server, port 4100 |
| `npm run build`   | Typecheck, then production build |
| `npm run typecheck` | `tsc --noEmit`           |
| `npm run lint`    | ESLint                     |

## Stack

Vite · React 18 · TypeScript · TanStack Router (file-based) · TanStack Query ·
Tailwind CSS v4 · Supabase JS · sonner · lucide-react.

Routes live in `src/routes/` and map to URLs by filename, so `src/routes/admin.tsx`
serves `/admin` — the same convention the original project used.

## Connecting Supabase

Copy `.env.example` to `.env` and fill in both values. Once set:

- the storefront reads the `products` table and falls back to the seed catalogue
  if the table is empty or unreachable;
- `/admin` accepts staff sign-in and can add, photograph and remove products.

Then apply every migration in `supabase/migrations/`, **in filename order** — each
one depends on the last:

| Migration | Creates |
| --- | --- |
| `20260804150000_create_products_and_site_settings.sql` | the `products` and `site_settings` tables, public-read policies, and the `site_settings` row with `id = 1` |
| `20260804160000_update_whatsapp_number.sql` | the contact details, plus the public `product-images` bucket |
| `20260804170000_restrict_writes_to_staff.sql` | the `staff` allow-list and every write policy on `products`, `site_settings` and `storage.objects` |
| `20260805120000_add_product_condition.sql` | the `condition` column behind the storefront's "Certified pre-owned" section |

Skipping any of them breaks the app in a way that is not obvious from the UI:

- without `…150000`, the next migration fails outright — it updates a table that
  does not exist yet;
- without `…170000`, sign-in works but every product write and every image upload
  is rejected by row-level security.

Two things about the bucket are worth stating plainly, because both have caught
people out: a *public* bucket grants public **reads** only, so uploads still need
an explicit INSERT policy on `storage.objects`; and `…170000` seeds the allow-list
with a single address. Change that address to your own before running it, or no
account will be able to manage the catalogue:

```sql
insert into public.staff (email, role) values ('you@example.com', 'admin');
```

## Contact details

`src/lib/site.ts` is the single source of truth for the phone number, WhatsApp
number, email and address. `src/lib/whatsapp.ts` builds every click-to-chat link
from it, so there are no hardcoded numbers anywhere else.

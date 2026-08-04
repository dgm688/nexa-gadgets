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

Then apply `supabase/migrations/20260804160000_update_whatsapp_number.sql`, which
updates `site_settings`, creates the public `product-images` bucket, and grants the
INSERT/DELETE policies on `storage.objects` that the uploader needs. A public bucket
only grants public *reads* — without those policies every upload fails on RLS.

## Contact details

`src/lib/site.ts` is the single source of truth for the phone number, WhatsApp
number, email and address. `src/lib/whatsapp.ts` builds every click-to-chat link
from it, so there are no hardcoded numbers anywhere else.

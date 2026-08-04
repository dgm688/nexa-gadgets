import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * True when both env vars are present. The storefront falls back to the seed
 * catalogue when this is false, so the site runs with no backend attached.
 */
export const isSupabaseConfigured = Boolean(url && publishableKey);

/**
 * Created against placeholder credentials when unconfigured — every call fails
 * fast rather than crashing the module graph at import time.
 */
export const supabase: SupabaseClient = createClient(
  url ?? "https://placeholder.supabase.co",
  publishableKey ?? "placeholder-anon-key",
);

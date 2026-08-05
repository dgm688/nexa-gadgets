import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_BUCKET = "product-images";

const PUBLIC_MARKER = `/storage/v1/object/public/${PRODUCT_BUCKET}/`;

/**
 * Recovers the object path from a public Storage URL.
 *
 * Returns null for anything that is not one of our uploads — the seed
 * catalogue references bundled assets like `/products/tv-lg.jpg`, and passing
 * those to a delete call would be meaningless at best.
 */
export function storagePathFromUrl(url: string): string | null {
  const at = url.indexOf(PUBLIC_MARKER);
  if (at === -1) return null;
  const path = url.slice(at + PUBLIC_MARKER.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Best-effort delete of uploaded objects.
 *
 * Deliberately never throws. Every caller is cleaning up alongside an action
 * the user cares about more — removing a thumbnail, deleting a product,
 * recovering from a failed batch — and a storage hiccup must not turn that
 * action into a visible failure. The cost of a missed delete is a stray file;
 * the cost of throwing here is a broken interaction.
 */
export async function removeStorageObjects(urls: string[]): Promise<void> {
  const paths = urls
    .map(storagePathFromUrl)
    .filter((p): p is string => p !== null);

  if (paths.length === 0) return;

  try {
    const { error } = await supabase.storage.from(PRODUCT_BUCKET).remove(paths);
    if (error) console.warn("Storage cleanup failed", error.message, paths);
  } catch (err) {
    console.warn("Storage cleanup threw", err);
  }
}

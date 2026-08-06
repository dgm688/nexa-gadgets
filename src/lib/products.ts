import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { PRODUCTS, type CategorySlug, type Product, type Spec } from "./catalog";

/** Neutral tile shown when a product has no photograph of its own. */
export const PLACEHOLDER_IMAGE = "/brand/placeholder.svg";

/** Shape of a row in the Supabase `products` table. */
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string;
  short_description: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  images: string[] | null;
  specs: Spec[] | null;
  is_new: boolean | null;
  featured: boolean | null;
  in_stock: boolean | null;
  condition: string | null;
  created_at: string;
};

const rowToProduct = (row: ProductRow): Product => ({
  slug: row.slug,
  name: row.name,
  brand: row.brand ?? "",
  category: row.category as CategorySlug,
  shortDescription: row.short_description ?? "",
  description: row.description ?? "",
  price: row.price,
  originalPrice: row.original_price ?? row.price,
  // A product saved without photos previously fell back to a bundled Hisense
  // TV shot, so an unrelated product's picture was presented as its own.
  images: row.images?.length ? row.images : [PLACEHOLDER_IMAGE],
  specs: row.specs ?? [],
  isNew: row.is_new ?? false,
  featured: row.featured ?? false,
  condition: row.condition === "certified-pre-owned" ? "certified-pre-owned" : "new",
  inStock: row.in_stock ?? true,
});

/**
 * Live catalogue. Reads the Supabase table when configured, otherwise serves
 * the seed catalogue so the storefront works without a backend.
 */
export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return PRODUCTS;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data?.length) return PRODUCTS;
  return (data as ProductRow[]).map(rowToProduct);
}

export const productsQuery = {
  queryKey: ["storefront-products"] as const,
  queryFn: fetchProducts,
  staleTime: 60_000,
};

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Search as SearchIcon } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductGrid, Section } from "@/components/Section";
import { PRODUCTS } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";

type SearchParams = { q: string };

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q);
  const { data: products = PRODUCTS } = useQuery(productsQuery);

  const needle = q.trim().toLowerCase();
  const results = needle
    ? products.filter((p) =>
        [p.name, p.brand, p.shortDescription, p.description]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      )
    : products;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/search", search: { q: term } });
  };

  return (
    <StoreLayout>
      <div className="bg-navy-deep text-white">
        <div className="container-page py-12">
          <h1 className="font-display text-3xl">
            {needle ? `Results for "${q}"` : "Find a product"}
          </h1>
          <form onSubmit={onSubmit} className="mt-6 flex max-w-xl">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search phones, laptops, TVs..."
              aria-label="Search products"
              className="h-12 w-full rounded-l-2xl bg-white px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="grid h-12 w-16 place-items-center rounded-r-2xl bg-gold text-navy-deep"
              aria-label="Search"
            >
              <SearchIcon className="size-4" />
            </button>
          </form>
          <p className="mt-4 text-sm text-white/60">
            {results.length} {results.length === 1 ? "product" : "products"}
          </p>
        </div>
      </div>

      <Section>
        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <p className="py-20 text-center text-muted-foreground">
            No products matched "{q}". Try a brand or a category name.
          </p>
        )}
      </Section>
    </StoreLayout>
  );
}

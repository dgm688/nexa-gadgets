import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ButtonPrimary, RevealGrid, RevealItem, Section } from "@/components/primitives";
import { PRODUCTS } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { whatsappGeneral } from "@/lib/whatsapp";
import { EASE_OUT } from "@/lib/motion";

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
      <div className="border-b border-[var(--color-hairline)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="container-page py-16 md:py-20"
        >
          <p className="eyebrow">Search</p>
          <h1 className="mt-3 text-4xl tracking-[-0.03em] md:text-5xl">
            {needle ? `“${q}”` : "Find a product"}
          </h1>

          <form onSubmit={onSubmit} className="relative mt-8 max-w-xl">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-faint)]" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search phones, laptops, TVs…"
              aria-label="Search products"
              className="h-13 w-full rounded-full border border-[var(--color-hairline)] bg-[var(--color-surface)] py-3.5 pl-11 pr-28 text-[16px] outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13px] font-semibold text-[#08090a] transition-colors hover:bg-white"
            >
              Search
            </button>
          </form>

          <p className="tabular mt-5 text-[13px] text-[var(--color-ink-faint)]">
            {results.length} {results.length === 1 ? "product" : "products"}
          </p>
        </motion.div>
      </div>

      <Section>
        {results.length > 0 ? (
          <RevealGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((p) => (
              <RevealItem key={p.slug}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGrid>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--color-hairline-strong)] px-6 py-24 text-center">
            <h2 className="text-2xl tracking-[-0.02em]">No matches for “{q}”</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-dim)]">
              Try a brand or a category name — or just tell us what you're after and we'll find it.
            </p>
            <ButtonPrimary href={whatsappGeneral()} external className="mt-8">
              Ask on WhatsApp
            </ButtonPrimary>
          </div>
        )}
      </Section>
    </StoreLayout>
  );
}

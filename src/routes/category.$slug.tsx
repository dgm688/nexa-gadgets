import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import { ButtonPrimary, RevealGrid, RevealItem, Section } from "@/components/primitives";
import { CATEGORIES, PRODUCTS, productsInCategory } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { whatsappGeneral } from "@/lib/whatsapp";
import { EASE_OUT } from "@/lib/motion";
import { useSeo } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/category/$slug")({ component: CategoryPage });

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: products = PRODUCTS } = useQuery(productsQuery);

  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) throw notFound();

  const items = productsInCategory(slug, products);

  useSeo({
    title: `${category.name} | ${SITE.name}`,
    description: `${category.blurb}. ${category.name} at ${SITE.name} — every price 20% below retail, in store in all 50 states with same-day delivery.`,
    path: `/category/${slug}`,
  });

  return (
    <StoreLayout>
      <div className="border-b border-[var(--color-hairline)]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="container-page py-16 md:py-20"
        >
          <p className="eyebrow">Category</p>
          <h1 className="mt-3 text-4xl tracking-[-0.03em] md:text-5xl">{category.name}</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-dim)]">
            {category.blurb}
          </p>
          <p className="tabular mt-6 text-[13px] text-[var(--color-ink-faint)]">
            {items.length} {items.length === 1 ? "product" : "products"} · every price already 20% off
          </p>
        </motion.div>
      </div>

      <Section>
        {items.length > 0 ? (
          <RevealGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <RevealItem key={p.slug}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGrid>
        ) : (
          <div className="rounded-3xl border border-dashed border-[var(--color-hairline-strong)] px-6 py-24 text-center">
            <h2 className="text-2xl tracking-[-0.02em]">Nothing listed here yet</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[var(--color-ink-dim)]">
              We stock this category in store — message us and we'll tell you exactly what's on the
              shelf today.
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

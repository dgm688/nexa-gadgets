import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductGrid, Section } from "@/components/Section";
import { CATEGORIES, PRODUCTS, productsInCategory } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { whatsappGeneral } from "@/lib/whatsapp";

export const Route = createFileRoute("/category/$slug")({ component: CategoryPage });

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: products = PRODUCTS } = useQuery(productsQuery);

  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) throw notFound();

  const items = productsInCategory(slug, products);

  return (
    <StoreLayout>
      <div className="bg-navy-deep text-white">
        <div className="container-page py-12">
          <h1 className="font-display text-3xl sm:text-4xl">{category.name}</h1>
          <p className="mt-2 text-white/75">{category.blurb}</p>
          <p className="mt-4 text-sm text-white/60">
            {items.length} {items.length === 1 ? "product" : "products"} · every price already 20%
            off
          </p>
        </div>
      </div>

      <Section>
        {items.length > 0 ? (
          <ProductGrid products={items} />
        ) : (
          <div className="rounded-3xl border border-dashed border-border py-20 text-center">
            <p className="font-display text-xl text-navy-deep">Nothing listed here yet</p>
            <p className="mt-2 text-muted-foreground">
              We stock this category in store — message us and we'll tell you what's on the shelf.
            </p>
            <a
              href={whatsappGeneral()}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block rounded-full bg-whatsapp px-6 py-3 text-sm font-bold text-white"
            >
              Ask on WhatsApp
            </a>
          </div>
        )}
      </Section>
    </StoreLayout>
  );
}

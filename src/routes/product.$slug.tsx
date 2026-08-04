import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Headphones, Store, Truck } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductGrid, Section, SectionHeading } from "@/components/Section";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { depositFor, discountPercent, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";
import { telHref, whatsappOrder } from "@/lib/whatsapp";

export const Route = createFileRoute("/product/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: products = PRODUCTS } = useQuery(productsQuery);

  const product = products.find((p) => p.slug === slug);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    if (product) document.title = `${product.name} | ${SITE.name}`;
  }, [product]);

  if (!product) throw notFound();

  const category = CATEGORIES.find((c) => c.slug === product.category);
  const off = discountPercent(product.price, product.originalPrice);
  const deposit = depositFor(product.price);
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 5);

  return (
    <StoreLayout>
      <div className="container-page pt-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-electric">
          Home
        </Link>
        {category && (
          <>
            {" / "}
            <Link
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="hover:text-electric"
            >
              {category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-sky/40">
            <img
              src={product.images[active]}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`size-20 overflow-hidden rounded-xl border-2 transition ${
                    i === active ? "border-electric" : "border-border hover:border-electric/50"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-3xl text-navy-deep sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-muted-foreground">{product.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-display text-4xl font-bold text-navy">
              {formatPrice(product.price)}
            </span>
            {off > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold text-white">
                  Save {off}%
                </span>
              </>
            )}
          </div>

          {product.inStock && (
            <p className="mt-3 font-semibold text-whatsapp">In stock — ready to deliver</p>
          )}

          <div className="mt-6 rounded-2xl border border-border bg-sky/40 p-5">
            <p className="font-semibold text-navy-deep">
              Pay {formatPrice(deposit)} now (50% deposit)
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The remaining {formatPrice(product.price - deposit)} is paid on delivery. Or pay in
              full at any Nexa store in your state and take it home the same day.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <a
              href={whatsappOrder(product)}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl bg-navy py-4 text-center font-bold text-white transition hover:brightness-110"
            >
              Order now — 50% deposit
            </a>
            <a
              href={telHref()}
              className="block rounded-2xl border border-border py-4 text-center font-semibold text-navy transition hover:border-electric"
            >
              Call {SITE.phone}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Store className="size-4 text-electric" />
              In store, all 50 states
            </span>
            <span className="inline-flex items-center gap-2">
              <Truck className="size-4 text-electric" />
              Same-day delivery
            </span>
            <span className="inline-flex items-center gap-2">
              <Headphones className="size-4 text-electric" />
              24/7 support
            </span>
          </div>
        </div>
      </div>

      {product.specs.length > 0 && (
        <Section className="!py-8">
          <h2 className="font-display text-xl text-navy-deep">Specifications</h2>
          <dl className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {product.specs.map((s) => (
              <div
                key={s.label}
                className="flex justify-between gap-4 border-b border-border py-2 text-sm"
              >
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="text-right font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      <Section className="!py-8">
        <h2 className="font-display text-xl text-navy-deep">Description</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-whatsapp" />
          Backed by our in-store warranty and 24/7 support line.
        </p>
      </Section>

      {related.length > 0 && (
        <Section>
          <SectionHeading title="You may also like" />
          <ProductGrid products={related} />
        </Section>
      )}
    </StoreLayout>
  );
}

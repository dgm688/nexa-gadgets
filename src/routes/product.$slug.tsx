import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, ChevronRight, Headphones, Store, Truck } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductCard } from "@/components/ProductCard";
import {
  ButtonGhost,
  ButtonPrimary,
  Pill,
  RevealGrid,
  RevealItem,
  Section,
  SectionHead,
} from "@/components/primitives";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { depositFor, discountPercent, formatPrice } from "@/lib/format";
import { SITE } from "@/lib/site";
import { telHref, whatsappOrder } from "@/lib/whatsapp";
import { EASE_OUT } from "@/lib/motion";

export const Route = createFileRoute("/product/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const { data, isPending } = useQuery(productsQuery);

  // Seed catalogue is a placeholder only until the query settles. A product
  // that exists in the database but not in the seed list is absent from that
  // first render, so 404 has to wait for real data — otherwise a direct load
  // of a newly added product throws before its row ever arrives.
  const products = data ?? PRODUCTS;
  const product = products.find((p) => p.slug === slug);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    if (product) document.title = `${product.name} | ${SITE.name}`;
  }, [product]);

  if (!product && isPending) return <ProductSkeleton />;
  if (!product) throw notFound();

  const category = CATEGORIES.find((c) => c.slug === product.category);
  const off = discountPercent(product.price, product.originalPrice);
  const deposit = depositFor(product.price);
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <StoreLayout>
      <nav
        aria-label="Breadcrumb"
        className="container-page flex items-center gap-1.5 pt-8 text-[13px] text-[var(--color-ink-faint)]"
      >
        <Link to="/" className="hover:text-[var(--color-ink)]">
          Home
        </Link>
        {category && (
          <>
            <ChevronRight className="size-3.5 opacity-50" />
            <Link
              to="/category/$slug"
              params={{ slug: category.slug }}
              className="hover:text-[var(--color-ink)]"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5 opacity-50" />
        <span className="truncate text-[var(--color-ink-dim)]">{product.name}</span>
      </nav>

      <div className="container-page grid gap-12 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <div className="overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-[var(--color-tile)]">
            <motion.img
              key={product.images[active]}
              src={product.images[active]}
              alt={product.name}
              width={900}
              height={900}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
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
                  aria-current={i === active}
                  className={`size-20 overflow-hidden rounded-xl border-2 bg-[var(--color-tile)] transition-colors ${
                    i === active
                      ? "border-[var(--color-accent)]"
                      : "border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.06 }}
        >
          <p className="eyebrow">{product.brand}</p>
          <h1 className="mt-3 text-3xl tracking-[-0.03em] sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-[16px] leading-relaxed text-[var(--color-ink-dim)]">
            {product.shortDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-baseline gap-3">
            <span className="tabular text-4xl font-semibold tracking-[-0.03em]">
              {formatPrice(product.price)}
            </span>
            {off > 0 && (
              <>
                <span className="tabular text-[15px] text-[var(--color-ink-faint)] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <Pill tone="sale">Save {off}%</Pill>
              </>
            )}
          </div>

          {product.inStock && (
            <p className="mt-3 inline-flex items-center gap-2 text-[13px] text-[var(--color-positive)]">
              <span className="size-1.5 rounded-full bg-[var(--color-positive)]" />
              In stock — ready to deliver
            </p>
          )}

          {/* The deposit split is the single biggest question a buyer has, so it
              sits directly above the CTA rather than below the fold. */}
          <div className="mt-8 rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[14px] text-[var(--color-ink-dim)]">Pay now (50%)</span>
              <span className="tabular text-lg font-semibold">{formatPrice(deposit)}</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-[var(--color-hairline)] pt-3">
              <span className="text-[14px] text-[var(--color-ink-dim)]">On delivery</span>
              <span className="tabular text-lg font-semibold">
                {formatPrice(product.price - deposit)}
              </span>
            </div>
            <p className="mt-4 text-[12px] leading-relaxed text-[var(--color-ink-faint)]">
              Or pay in full at any Nexa store in your state and take it home the same day.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <ButtonPrimary
              href={whatsappOrder(product)}
              external
              className="w-full py-4 text-[15px]"
            >
              Order now — {formatPrice(deposit)} deposit
            </ButtonPrimary>
            <ButtonGhost href={telHref()} className="tabular w-full py-4">
              Call {SITE.phone}
            </ButtonGhost>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--color-hairline)] pt-6">
            {[
              { icon: Store, label: "In store, 50 states" },
              { icon: Truck, label: "Same-day delivery" },
              { icon: Headphones, label: "24/7 support" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-[12px] text-[var(--color-ink-faint)]">
                <Icon className="mb-2 size-4" />
                {label}
              </div>
            ))}
          </div>

          {product.specs.length > 0 && (
            <div className="mt-10">
              <h2 className="eyebrow mb-4">Specifications</h2>
              <dl className="divide-y divide-[var(--color-hairline)] border-y border-[var(--color-hairline)]">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-6 py-3 text-[14px]">
                    <dt className="text-[var(--color-ink-faint)]">{s.label}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-10">
            <h2 className="eyebrow mb-4">Description</h2>
            <p className="text-[15px] leading-relaxed text-[var(--color-ink-dim)]">
              {product.description}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-[13px] text-[var(--color-ink-faint)]">
              <Check className="size-4 text-[var(--color-positive)]" />
              Backed by our in-store warranty and 24/7 support line.
            </p>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <Section className="border-t border-[var(--color-hairline)]">
          <SectionHead overline="More in this category" title="You may also like" />
          <RevealGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <RevealItem key={p.slug}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGrid>
        </Section>
      )}
    </StoreLayout>
  );
}

/**
 * Mirrors the real layout's dimensions so the swap to loaded content does not
 * shift anything. Marked aria-busy rather than aria-hidden so assistive tech
 * announces a pending region instead of an empty page.
 */
function ProductSkeleton() {
  const block = "animate-pulse rounded-xl bg-[var(--color-surface-2)]";
  return (
    <StoreLayout>
      <div
        className="container-page grid gap-12 py-14 lg:grid-cols-2 lg:gap-16"
        aria-busy="true"
        aria-label="Loading product"
      >
        <div className={`${block} aspect-square rounded-3xl`} />
        <div>
          <div className={`${block} h-3 w-24`} />
          <div className={`${block} mt-4 h-9 w-4/5`} />
          <div className={`${block} mt-4 h-4 w-3/5`} />
          <div className={`${block} mt-8 h-11 w-40`} />
          <div className={`${block} mt-8 h-32 rounded-2xl`} />
          <div className={`${block} mt-6 h-13 rounded-full`} />
          <div className={`${block} mt-3 h-13 rounded-full`} />
        </div>
      </div>
    </StoreLayout>
  );
}

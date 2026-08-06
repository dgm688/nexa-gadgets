import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Headphones, MapPin, ShieldCheck, Truck } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import {
  BTN_GHOST,
  ButtonPrimary,
  MotionLink,
  RevealGrid,
  RevealItem,
  Section,
  SectionHead,
} from "@/components/primitives";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { SITE } from "@/lib/site";
import { fadeUp, revealOnce } from "@/lib/motion";
import { useSaleActive } from "@/lib/sale";
import { telHref, whatsappGeneral } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({ component: Home });

const PROMISES = [
  { icon: MapPin, title: "Stores in all 50 states", body: "Buy in person, walk out with it" },
  { icon: Truck, title: "Same-day delivery", body: "Dispatched from your nearest store" },
  { icon: ShieldCheck, title: "50% deposit to reserve", body: "Balance paid on delivery" },
  { icon: Headphones, title: "24/7 support", body: "Chat or call any time, any day" },
];

const STEPS = [
  {
    n: "01",
    title: "Pick it up in store",
    body: "Physical shops in all 50 states. Walk in, see the product, pay in full and take it home the same day.",
  },
  {
    n: "02",
    title: "Or reserve with 50%",
    body: "Prefer delivery? Reserve any product with a 50% deposit and we dispatch from your nearest store.",
  },
  {
    n: "03",
    title: "Pay the rest at the door",
    body: "The remaining 50% goes to the driver when your order arrives. No hidden fees, no surprises.",
  },
];

const grid = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4";

function Home() {
  const { data: products = PRODUCTS } = useQuery(productsQuery);
  const saleActive = useSaleActive();

  const featured = products.find((p) => p.featured) ?? products[0];
  const onSale = products
    .filter((p) => p.originalPrice > p.price && p.slug !== featured?.slug)
    .slice(0, 8);
  const fresh = products.filter((p) => p.isNew).slice(0, 4);
  const preOwned = products.filter((p) => p.condition === "certified-pre-owned");

  return (
    <StoreLayout>
      <Hero featured={featured} />

      {/* Trust strip — hairline dividers instead of boxes, so it reads as one band. */}
      <div className="border-b border-[var(--color-hairline)]">
        <div className="container-page grid divide-y divide-[var(--color-hairline)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-[var(--color-hairline)]">
          {PROMISES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3 py-6 lg:px-6 lg:first:pl-0 lg:last:pr-0">
              <Icon className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-faint)]" />
              <div>
                <p className="text-[14px] font-medium tracking-[-0.01em]">{title}</p>
                <p className="mt-0.5 text-[12px] text-[var(--color-ink-faint)]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Section>
        <SectionHead
          overline={saleActive ? "Flash sale" : "Best sellers"}
          title={saleActive ? "20% off, while the clock runs" : "Reduced from retail"}
          lede={
            saleActive
              ? "Every price already reflects the discount. When the countdown ends, they go back up."
              : "Still below the recommended retail price on every product listed."
          }
          action={
            <MotionLink
              to="/search"
              search={{ q: "" }}
              className={`${BTN_GHOST} hidden sm:inline-flex`}
            >
              View all products
            </MotionLink>
          }
        />
        <RevealGrid className={grid}>
          {onSale.map((p) => (
            <RevealItem key={p.slug}>
              <ProductCard product={p} />
            </RevealItem>
          ))}
        </RevealGrid>
      </Section>

      <Section className="border-t border-[var(--color-hairline)]">
        <SectionHead
          overline="Categories"
          title="Shop by what you need"
          lede="Flagship phones through to CCTV kits — all stocked locally."
        />
        <RevealGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <RevealItem key={c.slug}>
              <Link
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group flex h-full items-center justify-between gap-4 rounded-xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-5 transition-colors duration-200 hover:border-[var(--color-hairline-strong)] hover:bg-[var(--color-surface-2)]"
              >
                <div className="min-w-0">
                  <p className="text-[15px] font-medium tracking-[-0.01em]">{c.name}</p>
                  <p className="mt-1 truncate text-[12px] text-[var(--color-ink-faint)]">
                    {c.blurb}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-[var(--color-ink-faint)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--color-ink)]" />
              </Link>
            </RevealItem>
          ))}
        </RevealGrid>
      </Section>

      {fresh.length > 0 && (
        <Section className="border-t border-[var(--color-hairline)]">
          <SectionHead overline="New arrivals" title="Just landed in store" />
          <RevealGrid className={grid}>
            {fresh.map((p) => (
              <RevealItem key={p.slug}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGrid>
        </Section>
      )}

      <Section className="border-t border-[var(--color-hairline)]">
        <SectionHead
          overline="How it works"
          title="Two ways to buy, no waiting on a warehouse"
          lede="We hold stock in physical shops in every state, so nothing ships from a distant depot."
        />
        <RevealGrid className="grid gap-5 md:grid-cols-3">
          {STEPS.map((s) => (
            <RevealItem key={s.n}>
              <div className="h-full rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] p-7">
                <span className="tabular font-mono text-[13px] text-[var(--color-accent-hot)]">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg tracking-[-0.02em]">{s.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-dim)]">
                  {s.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGrid>
      </Section>

      {preOwned.length > 0 && (
        <Section className="border-t border-[var(--color-hairline)]">
          <SectionHead
            overline="Certified pre-owned"
            title="Tested, graded, warranty backed"
            lede="Ex-UK machines that pass a full diagnostic before they reach the shelf."
          />
          <RevealGrid className={grid}>
            {preOwned.map((p) => (
              <RevealItem key={p.slug}>
                <ProductCard product={p} />
              </RevealItem>
            ))}
          </RevealGrid>
        </Section>
      )}

      <Section className="border-t border-[var(--color-hairline)]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={revealOnce}
          className="lit relative overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-[var(--color-surface)] px-7 py-14 text-center md:px-16 md:py-20"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.09] blur-[130px]"
            style={{ background: "var(--color-accent)" }}
          />
          <div className="relative">
            <p className="eyebrow">Not sure what to buy?</p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl md:text-[2.75rem] md:leading-[1.05]">
              Tell us your budget. We'll pick the right one.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--color-ink-dim)]">
              Our team is on 24/7. We'll recommend a product, hold it at your local store, and lock
              in the sale price for you.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonPrimary href={whatsappGeneral()} external>
                Chat with us
              </ButtonPrimary>
              <MotionLink to="/search" search={{ q: "" }} className={BTN_GHOST}>
                Browse products
              </MotionLink>
            </div>
            <p className="mt-7 text-[12px] text-[var(--color-ink-faint)]">
              Or call{" "}
              <a href={telHref()} className="tabular text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]">
                {SITE.phone}
              </a>{" "}
              · {SITE.address}
            </p>
          </div>
        </motion.div>
      </Section>
    </StoreLayout>
  );
}

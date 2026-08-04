import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Headphones, MapPin, ShieldCheck, Truck } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { Hero } from "@/components/Hero";
import { Countdown } from "@/components/Countdown";
import { ProductGrid, Section, SectionHeading } from "@/components/Section";
import { CATEGORIES, PRODUCTS, productsInCategory } from "@/lib/catalog";
import { productsQuery } from "@/lib/products";
import { SITE } from "@/lib/site";
import { telHref, whatsappGeneral } from "@/lib/whatsapp";
import { SALE } from "@/lib/site";

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
    body: "We have physical shops in all 50 states. Walk in, see the product, pay in full and take it home the same day.",
  },
  {
    n: "02",
    title: "Or pay a 50% deposit",
    body: "Prefer delivery? Reserve any product with a 50% deposit and we dispatch it from your nearest store.",
  },
  {
    n: "03",
    title: "Pay the balance on delivery",
    body: "The remaining 50% is paid to the driver when your order arrives at your door. No hidden fees.",
  },
];

function Home() {
  const { data: products = PRODUCTS } = useQuery(productsQuery);

  const onSale = products.filter((p) => p.originalPrice > p.price).slice(0, 10);
  const featured = products.filter((p) => p.featured).slice(0, 10);
  const fresh = products.filter((p) => p.isNew).slice(0, 10);
  const preOwned = products.filter((p) => p.condition === "certified-pre-owned");

  const spotlightCategories = ["mobile-phones", "computers", "tv-audio-systems", "audio-music"];

  return (
    <StoreLayout>
      <Hero />

      {PROMISES.length > 0 && (
        <div className="border-b border-border bg-card">
          <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROMISES.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky text-electric">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-navy-deep">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Section>
        <div className="flex flex-col items-center gap-8 rounded-3xl bg-navy px-6 py-12 text-center text-white lg:flex-row lg:justify-between lg:text-left">
          <div>
            <p className="text-xs font-bold tracking-widest text-gold">
              LIMITED TIME · 2 MONTHS ONLY
            </p>
            <h2 className="mt-3 font-display text-3xl">20% off every single product</h2>
            <p className="mt-3 max-w-lg text-white/80">
              Prices you see are already discounted. When the timer hits zero, they go back up.
            </p>
          </div>
          <Countdown endsAt={SALE.endsAt} />
        </div>
      </Section>

      <Section>
        <SectionHeading title="Shop by category" />
        <p className="-mt-4 mb-6 text-muted-foreground">
          Everything from flagship phones to CCTV kits.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="rounded-2xl border border-border bg-card p-5 transition hover:border-electric hover:shadow-md"
            >
              <p className="font-display text-lg font-semibold text-navy-deep">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Flash sale — 20% off" title="Sale prices while the countdown lasts" />
        <ProductGrid products={onSale} />
      </Section>

      <div className="bg-sky/50">
        <Section>
          <p className="text-xs font-bold tracking-widest text-electric">TWO WAYS TO BUY</p>
          <h2 className="mt-2 max-w-2xl font-display text-2xl text-navy-deep sm:text-3xl">
            Collect in store, or pay 50% now and 50% on delivery
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Because we hold stock in physical shops in every state, you never wait on a warehouse.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-display text-3xl font-bold text-sky-foreground text-electric/40">
                  {s.n}
                </span>
                <p className="mt-3 font-display text-lg font-semibold text-navy-deep">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section>
        <SectionHeading eyebrow="Featured picks" title="What our stores sell most" />
        <ProductGrid products={featured} />
      </Section>

      <Section>
        <SectionHeading eyebrow="New arrivals" title="Just landed in store" />
        <ProductGrid products={fresh} />
      </Section>

      {spotlightCategories.map((slug) => {
        const cat = CATEGORIES.find((c) => c.slug === slug);
        const items = productsInCategory(slug, products);
        if (!cat || items.length === 0) return null;
        return (
          <Section key={slug}>
            <SectionHeading title={cat.name} viewAllSlug={cat.slug} />
            <ProductGrid products={items} />
          </Section>
        );
      })}

      {preOwned.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Certified pre-owned" title="Tested, graded and warranty backed" />
          <ProductGrid products={preOwned} />
        </Section>
      )}

      <div className="bg-navy-deep text-white">
        <Section>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">
                A store in every state means same-day delivery
              </h2>
              <p className="mt-4 leading-relaxed text-white/80">
                We stock locally, not in one distant warehouse. Order before the day is out and a
                driver from your nearest Nexa store brings it to you — you pay the remaining 50% at
                the door.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8">
              <h3 className="font-display text-xl">Not sure what to buy? Our team is on 24/7</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Tell us your budget and what you need it for. We'll recommend the right product, hold
                it at your local store, and lock in the 20% sale price for you.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={whatsappGeneral()}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-whatsapp px-6 py-3 text-sm font-bold text-white transition hover:brightness-95"
                >
                  Chat with us
                </a>
                <Link
                  to="/search"
                  search={{ q: "" }}
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold transition hover:bg-white/10"
                >
                  Browse products
                </Link>
              </div>
              <p className="mt-5 text-xs text-white/60">
                Call{" "}
                <a href={telHref()} className="underline">
                  {SITE.phone}
                </a>{" "}
                · {SITE.address}
              </p>
            </div>
          </div>
        </Section>
      </div>
    </StoreLayout>
  );
}

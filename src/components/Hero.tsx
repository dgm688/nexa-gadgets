import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Store, Truck, Wallet } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { depositFor, discountPercent, formatPrice } from "@/lib/format";
import { SALE } from "@/lib/site";
import { whatsappOrder } from "@/lib/whatsapp";
import { EASE_OUT, stagger } from "@/lib/motion";
import { Countdown } from "./Countdown";
import { ButtonGhost, ButtonPrimary, Pill } from "./primitives";

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/**
 * Replaces the auto-rotating three-slide carousel.
 *
 * Carousels bury everything past slide one and move copy while it is being
 * read. A single fixed statement plus one genuinely shoppable product converts
 * better and removes an entire class of motion and a11y problems.
 */
export function Hero({ featured }: { featured?: Product }) {
  const off = featured ? discountPercent(featured.price, featured.originalPrice) : 0;

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-hairline)]">
      {/*
        One light source, sitting behind the product rather than behind the
        copy — it reads as the product being lit, and keeps the headline on
        clean dark so text contrast is never compromised by decoration.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 size-[34rem] rounded-full opacity-[0.10] blur-[140px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="container-page relative grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <motion.div variants={stagger(0.08)} initial="hidden" animate="show">
          <motion.div variants={item} className="flex flex-wrap items-center gap-3">
            <Pill tone="accent">20% off storewide</Pill>
            <span className="text-[13px] text-[var(--color-ink-faint)]">ends in</span>
            <Countdown endsAt={SALE.endsAt} />
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.25rem]"
          >
            Premium tech,
            <br />
            <span className="text-[var(--color-ink-dim)]">delivered today.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-md text-[16px] leading-relaxed text-[var(--color-ink-dim)]"
          >
            Physical stores in all 50 states. Reserve online with a 50% deposit and pay the
            balance at your door — or walk in and take it home the same day.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <ButtonPrimary href="/category/mobile-phones">
              Shop the sale
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </ButtonPrimary>
            <ButtonGhost href="/search?q=">Browse everything</ButtonGhost>
          </motion.div>

          <motion.dl
            variants={item}
            className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-[var(--color-hairline)] pt-7"
          >
            {[
              { icon: Store, k: "50 states", v: "Physical stores" },
              { icon: Truck, k: "Same day", v: "Local dispatch" },
              { icon: Wallet, k: "50% deposit", v: "Rest on delivery" },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k}>
                <Icon className="mb-2.5 size-4 text-[var(--color-ink-faint)]" />
                <dt className="text-[14px] font-semibold tracking-[-0.01em]">{k}</dt>
                <dd className="mt-0.5 text-[12px] text-[var(--color-ink-faint)]">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 }}
            className="lit relative overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-[var(--color-surface)]"
          >
            <Link
              to="/product/$slug"
              params={{ slug: featured.slug }}
              className="block aspect-4/3 overflow-hidden bg-[var(--color-tile)]"
            >
              <motion.img
                src={featured.images[0]}
                alt={featured.name}
                width={900}
                height={675}
                className="size-full object-cover"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
              />
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-5 p-6">
              <div className="min-w-0">
                <p className="eyebrow">{featured.brand} · Editor's pick</p>
                <Link
                  to="/product/$slug"
                  params={{ slug: featured.slug }}
                  className="mt-2 block truncate text-lg font-medium tracking-[-0.02em] hover:text-white"
                >
                  {featured.name}
                </Link>
                <div className="mt-2.5 flex items-baseline gap-2.5">
                  <span className="tabular text-2xl font-semibold tracking-[-0.02em]">
                    {formatPrice(featured.price)}
                  </span>
                  {off > 0 && (
                    <>
                      <span className="tabular text-[13px] text-[var(--color-ink-faint)] line-through">
                        {formatPrice(featured.originalPrice)}
                      </span>
                      <Pill tone="sale">−{off}%</Pill>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-[12px] text-[var(--color-ink-faint)]">
                  Reserve for {formatPrice(depositFor(featured.price))}
                </p>
              </div>

              <ButtonPrimary href={whatsappOrder(featured)} external className="shrink-0">
                Order now
              </ButtonPrimary>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

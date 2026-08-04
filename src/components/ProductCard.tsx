import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { depositFor, discountPercent, formatPrice } from "@/lib/format";
import { whatsappOrder } from "@/lib/whatsapp";
import { springSoft } from "@/lib/motion";
import { Pill } from "./primitives";

/**
 * The product image sits on a light tile so white-background photography reads
 * as a lit object against the dark page rather than a glowing rectangle.
 *
 * The card surface is a single stretched link (title → product page); the
 * WhatsApp CTA sits above it in the stacking order so the two targets never
 * overlap and no interactive element is nested inside another.
 */
export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product.price, product.originalPrice);

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={springSoft}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-[var(--color-surface)] transition-colors duration-200 hover:border-[var(--color-hairline-strong)]"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-[var(--color-tile)]">
        <motion.img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={900}
          height={675}
          className="size-full object-cover"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && <Pill tone="onImageSale">−{off}%</Pill>}
          {product.isNew && <Pill tone="onImageDark">New</Pill>}
          {product.condition === "certified-pre-owned" && (
            <Pill tone="onImageDark">Certified</Pill>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{product.brand}</p>

        <h3 className="mt-2 text-[15px] font-medium leading-snug tracking-[-0.01em]">
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="after:absolute after:inset-0 after:content-[''] hover:text-white"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-4 flex items-baseline gap-2.5">
          <span className="tabular text-xl font-semibold tracking-[-0.02em]">
            {formatPrice(product.price)}
          </span>
          {off > 0 && (
            <span className="tabular text-[13px] text-[var(--color-ink-faint)] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-[12px] text-[var(--color-ink-faint)]">
          or {formatPrice(depositFor(product.price))} now, rest on delivery
        </p>

        <div className="mt-5 flex-1" />

        <a
          href={whatsappOrder(product)}
          target="_blank"
          rel="noreferrer"
          className="relative z-10 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-[var(--color-hairline-strong)] py-3 text-[13px] font-semibold transition-colors duration-200 hover:border-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp)] hover:text-[#08090a]"
        >
          Order now
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </motion.article>
  );
}

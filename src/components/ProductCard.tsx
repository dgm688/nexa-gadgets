import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { depositFor, discountPercent, formatPrice } from "@/lib/format";
import { whatsappOrder } from "@/lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product.price, product.originalPrice);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-lg hover:shadow-navy/5">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-square overflow-hidden bg-sky/40"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {off > 0 && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-white">
              -{off}% flash sale
            </span>
          )}
          {product.isNew && (
            <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-navy-deep">
              New
            </span>
          )}
          {product.condition === "certified-pre-owned" && (
            <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold text-white">
              Certified pre-owned
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          {product.brand}
        </p>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="mt-1 line-clamp-2 font-display text-[15px] font-semibold leading-snug hover:text-electric"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold text-navy">{formatPrice(product.price)}</span>
          {off > 0 && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Reserve for {formatPrice(depositFor(product.price))} · rest on delivery
        </p>

        <a
          href={whatsappOrder(product)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-whatsapp px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
        >
          Order now
        </a>
      </div>
    </article>
  );
}

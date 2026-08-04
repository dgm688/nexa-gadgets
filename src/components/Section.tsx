import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

export function SectionHeading({
  eyebrow,
  title,
  viewAllSlug,
}: {
  eyebrow?: string;
  title: string;
  viewAllSlug?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold tracking-widest text-electric uppercase">{eyebrow}</p>
        )}
        <h2 className="mt-1 font-display text-2xl text-navy-deep sm:text-3xl">{title}</h2>
      </div>
      {viewAllSlug && (
        <Link
          to="/category/$slug"
          params={{ slug: viewAllSlug }}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-electric hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`container-page py-12 ${className}`}>{children}</section>;
}

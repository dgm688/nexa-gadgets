import type { Product } from "./catalog";
import { depositFor, formatPrice } from "./format";
import { SALE, SITE } from "./site";

const link = (message: string): string =>
  `https://wa.me/${SITE.whatsappFallback}?text=${encodeURIComponent(message)}`;

/** Generic "talk to us" entry point used by the header and support blocks. */
export const whatsappGeneral = (): string =>
  link(`Hi ${SITE.name}, I'd like help choosing a gadget.`);

/** Per-product "Order now" CTA, quoting the sale price and the 50% deposit. */
export const whatsappOrder = (product: Pick<Product, "name" | "price">): string =>
  link(
    `Hi ${SITE.name}, I'd like to order the ${product.name} (${formatPrice(product.price)} after ${SALE.percent}% flash sale). ` +
      `I'd like to pay the 50% deposit (${formatPrice(depositFor(product.price))}) and the balance on delivery.`,
  );

export const telHref = (): string => `tel:${SITE.phone.replace(/[^\d+]/g, "")}`;

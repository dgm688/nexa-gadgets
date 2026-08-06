import { useEffect, useState } from "react";
import { SALE } from "./site";

export const saleHasEnded = (now = Date.now()): boolean =>
  now >= new Date(SALE.endsAt).getTime();

/**
 * Whether the flash sale is still running.
 *
 * The end date is fixed, so without this the countdown would sit at zero
 * while the page kept promising "20% off, while the clock runs" — copy that
 * contradicts itself and, on a storefront, misstates the price on offer.
 *
 * Re-checks every 30s so a page left open across the deadline corrects itself
 * rather than needing a reload.
 */
export function useSaleActive(): boolean {
  const [active, setActive] = useState(() => !saleHasEnded());

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (saleHasEnded()) setActive(false);
    }, 30_000);
    return () => clearInterval(id);
  }, [active]);

  return active;
}

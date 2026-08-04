import { DEPOSIT_RATE } from "./site";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number): string => usd.format(value);

/** Half up front, half to the driver on delivery. */
export const depositFor = (price: number): number => Math.round(price * DEPOSIT_RATE);

export const discountPercent = (price: number, originalPrice: number): number =>
  originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

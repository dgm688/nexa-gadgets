/** Site-wide identity and contact details. */

export const SITE = {
  name: "Nexa Gadgets",
  tagline: "Premium tech, delivered same day from a store in your state",
  phone: "+1 507-817-9129",
  email: "sales@nexagadgets.com",
  address: "Retail locations in all 50 states",
  whatsappFallback: "15078179129",
} as const;

/** Storewide flash sale: 20% off everything, running for two months. */
export const SALE = {
  percent: 20,
  label: "20% OFF STOREWIDE · ENDS IN 2 MONTHS",
  endsAt: "2026-10-05T00:00:00Z",
} as const;

/** Deposit taken online; the balance is paid to the driver on delivery. */
export const DEPOSIT_RATE = 0.5;

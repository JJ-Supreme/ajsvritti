// Per-product cart cap, enforced centrally in the cart store and again in /api/checkout.
// Deliberately high: the site sells bulk tiers at 10 / 25 / 100+ units (see lib/utils/pricing.ts).
export const MAX_QTY_PER_ITEM = 500;

export const ORDER_STATUSES = [
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

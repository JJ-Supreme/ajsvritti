export const BULK_TIERS = [
  { minQty: 100, discount: 0.15 },
  { minQty: 25,  discount: 0.10 },
  { minQty: 10,  discount: 0.05 },
  { minQty: 1,   discount: 0    },
];

/** Returns the discounted unit price for a given quantity. */
export function getBulkUnitPrice(basePrice: number, quantity: number): number {
  const tier = BULK_TIERS.find((t) => quantity >= t.minQty);
  const discount = tier?.discount ?? 0;
  return Math.round(basePrice * (1 - discount));
}

/** Returns the discount percentage label for a given quantity (e.g. "5% off"), or null if no discount. */
export function getBulkDiscountLabel(quantity: number): string | null {
  const tier = BULK_TIERS.find((t) => quantity >= t.minQty);
  if (!tier || tier.discount === 0) return null;
  return `${tier.discount * 100}% off`;
}

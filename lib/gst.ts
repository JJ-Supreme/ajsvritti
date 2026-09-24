/**
 * Indian GST configuration and calculation utilities.
 *
 * A flat 18% GST applies to every item. The customer-facing breakdown shows
 * the tax explicitly and then waives it, so the customer pays exactly the
 * listed (whole-number) base price:
 *
 *   Base Amount        ₹3,000
 *   (+) IGST 18.00%    ₹  540   <- tax calculated on the base
 *   Total              ₹3,540
 *   (-) Discount       ₹  540   <- equal waiver of the GST
 *   Grand Total        ₹3,000   <- amount actually charged
 *
 * So `gst` is the 18% computed on the base, and `total` equals the subtotal
 * because the GST is fully discounted back.
 */

// Flat GST rate applied to all items.
export const GST_RATE = 0.18;

/**
 * Returns the 18% GST charged on a base amount (e.g. ₹3,000 -> ₹540).
 * This is the amount shown on both the "(+) IGST" line and the equal
 * "(-) Discount" (waiver) line.
 */
export function getDisplayGst(baseAmount: number): number {
  return Math.round(baseAmount * GST_RATE);
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the GST rate (e.g. 0.18) for a single item.
 *
 * The signature keeps `unitPrice` / `topLevelCategory` so existing callers do
 * not need to change, but the rate is now a flat 18% for every item.
 */
export function getItemGstRate(
  _unitPrice?: number,
  _topLevelCategory?: string
): number {
  return GST_RATE;
}

/**
 * Calculates the charge breakdown for an array of cart-like items.
 * Each item must expose at least { price, quantity, topLevelCategory? }.
 *
 * Returns:
 *  - `subtotal`: base amount (sum of line totals)
 *  - `gst`:      18% GST charged on the base (shown, then waived)
 *  - `total`:    amount actually charged — equals `subtotal`, because the GST
 *                is fully discounted back so the customer pays the base price.
 */
export function calculateOrderGst(
  items: { price: number; quantity: number; topLevelCategory?: string }[]
): { gst: number; subtotal: number; total: number } {
  let subtotal = 0;

  for (const item of items) {
    subtotal += item.price * item.quantity;
  }

  // GST is calculated on the base and then waived via an equal discount, so
  // the customer pays exactly the base amount (a whole number).
  const gst = Math.round(subtotal * GST_RATE);
  return { gst, subtotal, total: subtotal };
}

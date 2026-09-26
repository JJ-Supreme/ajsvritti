/**
 * Indian GST utilities — AJS invoice pattern.
 *
 * The listed/unit price is the BASE amount. Every AJS invoice shows GST on top
 * of it and then discounts the same GST back, so what the customer pays
 * (Grand Total) always equals the base amount:
 *
 *   Base Amount        ₹100
 *   (+) SGST 9%        ₹  9
 *   (+) CGST 9%        ₹  9
 *   Total              ₹118
 *   (-) Discount       ₹ 18   (= the GST)
 *   Grand Total        ₹100   (= Base Amount)
 *
 * gst = round(base * 18%). Intra-state orders (shipping state == seller state)
 * split it into CGST + SGST; other states show IGST. (The sample invoice shows
 * CGST/SGST even for a Kerala customer; we deliberately stay state-aware.)
 * Rounding: CGST takes the extra rupee when gst is odd, so cgst + sgst == gst.
 *
 * This single function feeds the cart, checkout, server, email, confirmation
 * page and order history so the numbers cannot drift apart.
 */
import { SELLER_STATE } from "@/config/client";

export const GST_RATE = 0.18;

export type TaxBreakdown = {
  rate: number;
  base_amount: number;
  gst: number; // total GST shown (and discounted back)
  cgst: number;
  sgst: number;
  igst: number;
  is_intra_state: boolean;
  state_known: boolean; // false => only the combined `gst` line is meaningful
  total_with_gst: number; // base + gst
  discount: number; // == gst
  grand_total: number; // == base_amount (what the customer pays)
  state: string | null;
  seller_state: string;
};

const normaliseState = (s?: string | null) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/^newdelhi$/, "delhi");

export function isIntraState(shippingState?: string | null): boolean {
  const a = normaliseState(shippingState);
  return !!a && a === normaliseState(SELLER_STATE);
}

/** Invoice-style GST for a base amount (sum of the items, after bulk discount). */
export function computeInvoiceTax(baseAmount: number, shippingState?: string | null): TaxBreakdown {
  const base = Math.max(0, Math.round(baseAmount || 0));
  const gst = Math.round(base * GST_RATE);
  const known = !!normaliseState(shippingState);
  const intra = isIntraState(shippingState);
  const cgst = known && intra ? Math.ceil(gst / 2) : 0;
  const sgst = known && intra ? gst - cgst : 0;
  return {
    rate: GST_RATE,
    base_amount: base,
    gst,
    cgst,
    sgst,
    igst: known && !intra ? gst : 0,
    is_intra_state: known && intra,
    state_known: known,
    total_with_gst: base + gst,
    discount: gst,
    grand_total: base,
    state: shippingState || null,
    seller_state: SELLER_STATE,
  };
}

/** Rebuilds a breakdown for orders stored without one (or in the old shape): base == order total. */
export function taxForStoredOrder(stored: any, total: number, shippingState?: string | null): TaxBreakdown {
  if (stored && typeof stored.base_amount === "number" && typeof stored.gst === "number") {
    return stored as TaxBreakdown;
  }
  return computeInvoiceTax(total, shippingState);
}

/** Cart-level totals. `total` is the Grand Total the customer pays (== subtotal, i.e. the base amount). */
export function calculateOrderGst(
  items: { price: number; quantity: number; topLevelCategory?: string }[]
): { gst: number; subtotal: number; total: number } {
  let subtotal = 0;
  for (const item of items) subtotal += item.price * item.quantity;
  return { gst: computeInvoiceTax(subtotal).gst, subtotal, total: subtotal };
}

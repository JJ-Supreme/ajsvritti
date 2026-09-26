/**
 * Indian GST utilities.
 *
 * Every listed price is GST-inclusive at a flat 18%. The order total therefore
 * already contains the tax; this module only *unbundles* it for display and
 * records:
 *   taxable value = round(total / 1.18)
 *   gst           = total - taxable value
 * Intra-state orders (shipping state == seller state) split the GST into
 * CGST + SGST halves; every other state is IGST.
 *
 * This single function feeds the cart, checkout, server, email, confirmation
 * page and order history so the numbers cannot drift apart.
 */
import { SELLER_STATE } from "@/config/client";

export const GST_RATE = 0.18;

export type TaxBreakdown = {
  rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  is_intra_state: boolean;
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

/** Unbundles the GST already included in a tax-inclusive `total`. */
export function computeTaxBreakdown(total: number, shippingState?: string | null): TaxBreakdown {
  const safeTotal = Math.max(0, Math.round(total || 0));
  const taxable = Math.round(safeTotal / (1 + GST_RATE));
  const gst = safeTotal - taxable;
  const intra = isIntraState(shippingState);
  const cgst = intra ? Math.floor(gst / 2) : 0;
  const sgst = intra ? gst - cgst : 0;
  return {
    rate: GST_RATE,
    taxable_value: taxable,
    cgst,
    sgst,
    igst: intra ? 0 : gst,
    is_intra_state: intra,
    state: shippingState || null,
    seller_state: SELLER_STATE,
  };
}

export const totalGst = (t: Pick<TaxBreakdown, "cgst" | "sgst" | "igst">) => t.cgst + t.sgst + t.igst;

/** Cart-level totals. Prices are tax-inclusive, so `total === subtotal`. */
export function calculateOrderGst(
  items: { price: number; quantity: number; topLevelCategory?: string }[]
): { gst: number; subtotal: number; total: number } {
  let subtotal = 0;
  for (const item of items) subtotal += item.price * item.quantity;
  const { taxable_value } = computeTaxBreakdown(subtotal);
  return { gst: subtotal - taxable_value, subtotal, total: subtotal };
}

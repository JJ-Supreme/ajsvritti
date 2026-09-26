import type { TaxBreakdown } from "@/lib/gst";
import { formatPrice } from "@/lib/utils/currency";

// Same rows everywhere an order's totals are shown (confirmation page, order history).
export function TaxLines({ tax, total }: { tax: TaxBreakdown; total: number }) {
  return (
    <div className="pt-3 mt-1 border-t space-y-1.5 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Taxable value</span>
        <span className="tabular-nums">{formatPrice(tax.taxable_value)}</span>
      </div>
      {tax.is_intra_state ? (
        <>
          <div className="flex justify-between text-gray-600">
            <span>CGST (9%)</span>
            <span className="tabular-nums">{formatPrice(tax.cgst)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>SGST (9%)</span>
            <span className="tabular-nums">{formatPrice(tax.sgst)}</span>
          </div>
        </>
      ) : (
        <div className="flex justify-between text-gray-600">
          <span>IGST (18%)</span>
          <span className="tabular-nums">{formatPrice(tax.igst)}</span>
        </div>
      )}
      <div className="flex justify-between text-gray-600">
        <span>Shipping</span>
        <span>Free</span>
      </div>
      <div className="flex justify-between font-semibold text-base pt-1.5 border-t">
        <span>Grand Total</span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </div>
      <p className="text-xs text-gray-500">All prices are inclusive of GST.</p>
    </div>
  );
}

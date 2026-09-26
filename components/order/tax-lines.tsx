import type { TaxBreakdown } from "@/lib/gst";
import { formatPrice } from "@/lib/utils/currency";

// Invoice-style rows, shared by the confirmation page and order history:
// Base Amount, (+) GST, Total, (-) Discount, Grand Total (== Base Amount).
export function TaxLines({ tax }: { tax: TaxBreakdown; total?: number }) {
  return (
    <div className="pt-3 mt-1 border-t space-y-1.5 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Base Amount</span>
        <span className="tabular-nums">{formatPrice(tax.base_amount)}</span>
      </div>
      {tax.state_known && tax.is_intra_state && (
        <>
          <div className="flex justify-between text-gray-600">
            <span>(+) SGST: 9.00%</span>
            <span className="tabular-nums">{formatPrice(tax.sgst)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>(+) CGST: 9.00%</span>
            <span className="tabular-nums">{formatPrice(tax.cgst)}</span>
          </div>
        </>
      )}
      {tax.state_known && !tax.is_intra_state && (
        <div className="flex justify-between text-gray-600">
          <span>(+) IGST: 18.00%</span>
          <span className="tabular-nums">{formatPrice(tax.igst)}</span>
        </div>
      )}
      {!tax.state_known && (
        <div className="flex justify-between text-gray-600">
          <span>(+) GST: 18.00%</span>
          <span className="tabular-nums">{formatPrice(tax.gst)}</span>
        </div>
      )}
      <div className="flex justify-between text-gray-800 font-medium">
        <span>Total</span>
        <span className="tabular-nums">{formatPrice(tax.total_with_gst)}</span>
      </div>
      <div className="flex justify-between text-emerald-600">
        <span>(-) Discount</span>
        <span className="tabular-nums">{formatPrice(tax.discount)}</span>
      </div>
      <div className="flex justify-between font-semibold text-base pt-1.5 border-t">
        <span>Grand Total</span>
        <span className="tabular-nums">{formatPrice(tax.grand_total)}</span>
      </div>
    </div>
  );
}

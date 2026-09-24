"use client";

import { useState } from "react";
import useCart from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils/currency";
import { calculateOrderGst } from "@/lib/gst";
import { CheckoutForm } from "./checkout-form";
import { X } from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth-user";
import Link from "next/link";
import { getBulkUnitPrice } from "@/lib/utils/pricing";

export function Summary() {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const items = useCart((state) => state.items);
  const router = useRouter();
  const { isSignedIn } = useAuthUser();

  const { subtotal: discountedSubtotal, gst: totalGst, total: grandTotal } = calculateOrderGst(
    items.map((item) => ({
      price: getBulkUnitPrice(item.price, item.quantity),
      quantity: item.quantity,
      topLevelCategory: item.topLevelCategory,
    }))
  );

  // Original MRP subtotal (before any bulk discount)
  const originalSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Total discount = difference between full price and bulk-discounted price
  const totalDiscount = originalSubtotal - discountedSubtotal;

  const handleCheckoutClick = () => {
    if (items.length === 0) {
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleBackToCart = () => {
    setShowCheckoutForm(false);
  };

  const handleOrderSuccess = () => {
    setShowCheckoutForm(false);
    router.push("/order-confirmation");
  };

  if (showCheckoutForm) {
    return (
      <div className="mt-16 rounded-lg bg-surface-1 p-6 lg:mt-0 lg:col-span-5 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">Checkout</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToCart}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-2">
          <CheckoutForm 
            onSuccess={handleOrderSuccess} 
            onBack={handleBackToCart} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 rounded-lg bg-surface-1 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-foreground">Order Summary</h2>
      <div className="mt-6 space-y-4">
        {totalDiscount > 0 && (
          <>
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">Subtotal (MRP)</div>
              <p className="text-foreground font-medium tabular-nums">{formatPrice(originalSubtotal)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-sm text-emerald-600 font-medium">Bulk Discount</div>
              <p className="text-emerald-600 font-medium tabular-nums">−{formatPrice(totalDiscount)}</p>
            </div>
          </>
        )}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">Base Amount</div>
          <p className="text-foreground font-medium tabular-nums">{formatPrice(discountedSubtotal)}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">(+) IGST: 18.00%</div>
          <p className="text-foreground font-medium tabular-nums">{formatPrice(totalGst)}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">Total</div>
          <p className="text-foreground font-medium tabular-nums">{formatPrice(discountedSubtotal + totalGst)}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm text-emerald-600 font-medium">(−) Discount</div>
          <p className="text-emerald-600 font-medium tabular-nums">−{formatPrice(totalGst)}</p>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">Shipping</div>
          <p className="text-foreground font-medium">
            {originalSubtotal > 0 ? "Calculated at checkout" : "Free"}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="text-base font-semibold text-foreground">Grand Total</div>
          <p className="text-lg font-semibold text-foreground tabular-nums">
            {formatPrice(grandTotal)}
          </p>
        </div>
      </div>
      {!isSignedIn && items.length > 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-accent/50 p-4 text-sm text-center space-y-3">
          <p className="text-foreground">You must log in to your account to purchase products.</p>
          <Link
            href="/sign-in"
            className="inline-block w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white text-center hover:bg-primary/90 transition-colors"
          >
            Log In
          </Link>
        </div>
      ) : (
        <Button
          onClick={handleCheckoutClick}
          disabled={items.length === 0}
          className="w-full mt-6 rounded-lg font-semibold text-base"
        >
          {items.length > 0 ? "Proceed to Checkout" : "Your cart is empty"}
        </Button>
      )}
    </div>
  );
}

export default Summary;

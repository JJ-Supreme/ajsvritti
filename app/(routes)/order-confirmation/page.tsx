"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useCart from "@/hooks/use-cart";

const OrderConfirmationPage = () => {
  const router = useRouter();
  const removeAllCart = useCart((state) => state.removeAllCart);

  // After a redirect-based payment (e.g. Paytm) the customer returns here with
  // an ?orderId= param; the checkout component is gone, so the cart must be
  // cleared here. Verify the order is genuinely paid first so a tampered
  // ?orderId= URL can't clear the cart for an unpaid/forged order.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const orderId = new URLSearchParams(window.location.search).get("orderId");
    if (!orderId) return;

    let cancelled = false;
    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.paymentStatus === "success") {
          removeAllCart();
        }
      })
      .catch(() => {
        /* leave cart intact if verification fails */
      });

    return () => {
      cancelled = true;
    };
  }, [removeAllCart]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="h-24 w-24 text-green-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
        </div>

        <div className="space-y-3 pt-6">
          <Button
            className="w-full"
            size="lg"
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </Button>

          <p className="text-sm text-gray-500">
            Questions? Contact us at{" "}
            <Link
              href="mailto:ajsvrttivision@gmail.com"
              className="text-blue-600 hover:underline"
            >
              ajsvrttivision@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

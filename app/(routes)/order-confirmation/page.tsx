"use client";

import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import useCart from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils/currency";
import { TaxLines } from "@/components/order/tax-lines";
import { paymentMethodLabel, statusBadge } from "@/components/order/status";

type ConfirmedOrder = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  totalAmount: number;
  taxBreakdown: any;
  address: string;
  customerName: string;
  createdAt: string;
  orderItems: { id: string; productName: string; quantity: number; price: number }[];
};

function ConfirmationContent() {
  const router = useRouter();
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const legacyOrderId = params.get("orderId");
  const removeAllCart = useCart((state) => state.removeAllCart);
  const [order, setOrder] = useState<ConfirmedOrder | null>(null);
  const [loading, setLoading] = useState(!!orderNumber);

  // After a redirect-based payment the customer returns here with an ?orderId=
  // param; verify the order is genuinely paid before clearing the cart so a
  // tampered URL can't clear the cart for an unpaid/forged order.
  useEffect(() => {
    if (!legacyOrderId) return;
    let cancelled = false;
    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: legacyOrderId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.paymentStatus === "success") removeAllCart();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [legacyOrderId, removeAllCart]);

  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;
    axios
      .get(`/api/orders/${encodeURIComponent(orderNumber)}`)
      .then(({ data }) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const badge = order ? statusBadge(order.status) : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your order. We&apos;ll send you a confirmation email shortly.
          </p>
          {orderNumber && (
            <p className="text-sm text-gray-500">
              Order number: <span className="font-mono font-semibold text-foreground">{orderNumber}</span>
            </p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {order && badge && (
          <div className="border rounded-lg bg-white p-4 sm:p-6 space-y-4 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-between">
              <div>
                <p className="text-gray-500">Payment method</p>
                <p className="font-medium">{paymentMethodLabel(order.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment status</p>
                <p className="font-medium">
                  {order.isPaid ? "Paid" : order.paymentMethod === "cod" ? "Pay on delivery" : "Pending"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Order status</p>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">
                    {item.productName} <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                  <span className="tabular-nums shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <TaxLines tax={order.taxBreakdown} total={order.totalAmount} />

            <div className="pt-2 border-t">
              <p className="text-gray-500">Delivering to</p>
              <p className="font-medium break-words">
                {order.customerName ? `${order.customerName}, ` : ""}
                {order.address}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2 text-center">
          {orderNumber && (
            <Link href={`/track-order?order=${encodeURIComponent(orderNumber)}`} className="block">
              <Button variant="outline" className="w-full" size="lg">
                Track Order
              </Button>
            </Link>
          )}
          <Button className="w-full" size="lg" onClick={() => router.push("/")}>
            Continue Shopping
          </Button>

          <p className="text-sm text-gray-500">
            Questions? Contact us at{" "}
            <Link href="mailto:ajsvrttivision@gmail.com" className="text-blue-600 hover:underline">
              ajsvrttivision@gmail.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const OrderConfirmationPage = () => (
  <Suspense fallback={null}>
    <ConfirmationContent />
  </Suspense>
);

export default OrderConfirmationPage;

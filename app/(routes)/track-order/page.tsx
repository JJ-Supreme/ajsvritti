"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Check, Loader2, PackageSearch, XCircle } from "lucide-react";
import Container from "@/components/ui/container";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils/currency";
import { TIMELINE_STEPS, completedSteps, paymentMethodLabel, statusBadge } from "@/components/order/status";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  shipTo?: string;
  address?: string;
  orderItems: { id: string; productName: string; quantity: number; price: number }[];
};

function Timeline({ status }: { status: string }) {
  const done = completedSteps(status);
  const cancelled = status === "cancelled";
  return (
    <ol className="space-y-0">
      {TIMELINE_STEPS.map((label, i) => {
        const isDone = i < done;
        const isCurrent = i === done - 1 && !cancelled;
        return (
          <li key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`h-7 w-7 rounded-full flex items-center justify-center border-2 text-xs ${
                  isDone ? "bg-primary border-primary text-white" : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isDone ? <Check size={14} /> : i + 1}
              </span>
              {i < TIMELINE_STEPS.length - 1 && (
                <span className={`w-0.5 h-8 ${i < done - 1 ? "bg-primary" : "bg-gray-200"}`} />
              )}
            </div>
            <div className="pb-6">
              <p className={`text-sm font-medium ${isDone ? "text-foreground" : "text-gray-400"}`}>{label}</p>
              {i === 0 && status === "pending_payment" && (
                <p className="text-xs text-yellow-700">Waiting for your payment to be confirmed</p>
              )}
              {isCurrent && i > 0 && <p className="text-xs text-primary">Current status</p>}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="flex gap-3 items-center text-red-600">
          <XCircle size={26} />
          <p className="text-sm font-medium">This order was cancelled</p>
        </li>
      )}
    </ol>
  );
}

function TrackContent() {
  const params = useSearchParams();
  const initialOrder = params.get("order") || "";
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(!!initialOrder);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  // A signed-in owner arriving from "Track Order" sees the order straight away;
  // anyone else falls back to the number + phone form.
  useEffect(() => {
    if (!initialOrder) return;
    let cancelled = false;
    axios
      .get(`/api/orders/${encodeURIComponent(initialOrder)}`)
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
  }, [initialOrder]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post("/api/track", { orderNumber, phone });
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setError(err?.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const badge = order ? statusBadge(order.status) : null;

  return (
    <Container>
      <div className="py-8 sm:py-12 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <PackageSearch className="h-7 w-7" />
          <h1 className="text-2xl sm:text-3xl font-bold">Track Your Order</h1>
        </div>

        {!order && (
          <form onSubmit={onSubmit} className="bg-white border rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div>
              <label className="text-sm font-medium" htmlFor="track-order-number">Order number</label>
              <Input
                id="track-order-number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. AJS1234567890"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="track-phone">Phone number used for the order</label>
              <Input
                id="track-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit phone number"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...
                </>
              ) : (
                "Track Order"
              )}
            </Button>
          </form>
        )}

        {order && badge && (
          <div className="bg-white border rounded-xl p-5 sm:p-6 space-y-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Order number</p>
                <p className="font-mono font-semibold">{order.orderNumber}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on{" "}
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </div>
              <span className={`self-start px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
            </div>

            <Timeline status={order.status} />

            <div className="border-t pt-4 space-y-2 text-sm">
              {order.orderItems.map((i) => (
                <div key={i.id} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">
                    {i.productName} <span className="text-gray-500">× {i.quantity}</span>
                  </span>
                  <span className="tabular-nums shrink-0">{formatPrice(i.price * i.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total ({paymentMethodLabel(order.paymentMethod)})</span>
                <span className="tabular-nums">{formatPrice(order.totalAmount)}</span>
              </div>
              {(order.address || order.shipTo) && (
                <p className="text-gray-600 pt-1">Delivering to: {order.address || order.shipTo}</p>
              )}
            </div>

            <Button variant="outline" onClick={() => setOrder(null)}>
              Track another order
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}

const TrackOrderPage = () => (
  <>
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
    <Footer />
  </>
);

export default TrackOrderPage;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/currency";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/admin/orders";

type Order = {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  cod_fee: number;
  total: number;
  payment_method: string;
  payment_id: string | null;
  razorpay_order_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  notes: string | null;
  shipping_address: Record<string, string> | null;
  created_at: string;
  order_items: {
    id: string;
    product_id: number | null;
    product_name: string;
    product_image: string | null;
    quantity: number;
    unit_price: number;
    size: string | null;
    color: string | null;
  }[];
};

const badge: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const Row = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
  <div className="py-2.5 border-b last:border-0 text-sm">
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className={`font-medium break-words ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
  </div>
);

const SumRow = ({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) => (
  <div className={`flex justify-between py-1 text-sm ${strong ? "border-t mt-2 pt-3 text-base font-semibold" : ""}`}>
    <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
    <span className="tabular-nums">{value}</span>
  </div>
);

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery<Order>({
    queryKey: ["admin-order", orderId],
    queryFn: async () => (await axios.get(`/api/admin/orders/${orderId}`)).data.order,
  });

  useEffect(() => {
    if (data) setStatus(data.status);
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, { status });
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Could not update status");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="p-8"><Spinner /></div>;
  if (error || !data) return <p className="p-4">Order not found.</p>;

  const a = data.shipping_address || {};
  const cityLine = [a.city, a.state, a.pincode].filter(Boolean).join(", ");
  const units = data.order_items.reduce((n, i) => n + i.quantity, 0);
  const isCod = data.payment_method === "cod";

  return (
    <div className="p-3 sm:p-4 mt-2 max-w-6xl">
      <Link href="/admin/orders" className="inline-flex items-center text-sm text-primary hover:underline mb-3">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold font-mono">{data.order_number}</h1>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge[data.status] || "bg-gray-100"}`}>
          {STATUS_LABEL[data.status] || data.status}
        </span>
        <p className="w-full text-sm text-muted-foreground">
          Placed {new Date(data.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
          {isCod ? "Cash on Delivery" : "Online (Razorpay)"}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Items{" "}
                <span className="text-muted-foreground font-normal">
                  ({units} {units === 1 ? "unit" : "units"})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {data.order_items.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-surface-1">
                      {i.product_image && <Image src={i.product_image} alt="" fill sizes="56px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug">{i.product_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatPrice(i.unit_price)} × {i.quantity}
                        {(i.size || i.color) && ` · ${[i.size, i.color].filter(Boolean).join(" / ")}`}
                      </p>
                    </div>
                    <p className="text-sm font-medium tabular-nums">{formatPrice(i.unit_price * i.quantity)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t">
                <SumRow label="Subtotal" value={formatPrice(data.subtotal)} />
                {data.discount > 0 && <SumRow label="Discount" value={`−${formatPrice(data.discount)}`} />}
                <SumRow label="Shipping" value={data.shipping_fee ? formatPrice(data.shipping_fee) : "Free"} />
                {data.cod_fee > 0 && <SumRow label="COD fee" value={formatPrice(data.cod_fee)} />}
                <SumRow label="Total" value={formatPrice(data.total)} strong />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-surface-1 px-3 text-sm"
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <Button onClick={save} disabled={saving || status === data.status} className="w-full">
                {saving ? "Saving…" : "Update status"}
              </Button>
              {data.status === "pending_payment" && (
                <p className="text-xs text-amber-700">
                  This online order has not been paid yet. Only confirm it manually after checking the payment in Razorpay.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Name" value={a.name || "—"} />
              <Row label="Email" value={data.guest_email || "—"} />
              <Row label="Phone" value={data.guest_phone || a.phone || "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery</CardTitle>
            </CardHeader>
            <CardContent>
              <Row
                label="Address"
                value={
                  <>
                    {a.street && <span className="block">{a.street}</span>}
                    {a.post_office && <span className="block">{a.post_office}</span>}
                    {cityLine && <span className="block">{cityLine}</span>}
                    {!a.street && !cityLine && "—"}
                  </>
                }
              />
              {data.notes && <Row label="Customer notes" value={data.notes} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Row label="Method" value={isCod ? "Cash on Delivery" : "Online (Razorpay)"} />
              {!isCod && <Row label="Payment ID" value={data.payment_id || "—"} mono />}
              {!isCod && <Row label="Razorpay order" value={data.razorpay_order_id || "—"} mono />}
              <Row label="Amount" value={formatPrice(data.total)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

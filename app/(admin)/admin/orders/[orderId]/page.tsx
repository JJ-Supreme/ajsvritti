"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import TitleHeader from "../../../_components/title-header";
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
  tax_breakdown: Record<string, any> | null;
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

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1.5 text-sm border-b last:border-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right break-all">{value}</span>
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
  const address = [a.street, a.post_office, a.city, a.state, a.pincode].filter(Boolean).join(", ");

  return (
    <div className="p-3 sm:p-4 mt-2 max-w-4xl">
      <Link href="/admin/orders" className="inline-flex items-center text-sm text-primary hover:underline mb-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> All orders
      </Link>
      <TitleHeader title={`Order ${data.order_number}`} description={`Placed ${new Date(data.created_at).toLocaleString("en-IN")}`} />

      <div className="grid gap-4 md:grid-cols-2">
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
            <Button onClick={save} disabled={saving || status === data.status}>
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
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Method" value={data.payment_method === "cod" ? "Cash on Delivery" : "Online (Razorpay)"} />
            <Row label="Payment ID" value={data.payment_id || "—"} />
            <Row label="Razorpay order" value={data.razorpay_order_id || "—"} />
            <Row label="Total" value={formatPrice(data.total)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer & delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Name" value={a.name || "—"} />
            <Row label="Email" value={data.guest_email || "—"} />
            <Row label="Phone" value={data.guest_phone || a.phone || "—"} />
            <Row label="Address" value={address || "—"} />
            {data.notes && <Row label="Notes" value={data.notes} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amounts</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Subtotal" value={formatPrice(data.subtotal)} />
            {data.discount > 0 && <Row label="Discount" value={`−${formatPrice(data.discount)}`} />}
            <Row label="Shipping" value={data.shipping_fee ? formatPrice(data.shipping_fee) : "Free"} />
            {data.cod_fee > 0 && <Row label="COD fee" value={formatPrice(data.cod_fee)} />}
            <Row label="Total" value={formatPrice(data.total)} />
            {data.tax_breakdown &&
              Object.entries(data.tax_breakdown).map(([k, v]) => (
                <Row key={k} label={k.replace(/_/g, " ")} value={typeof v === "number" ? formatPrice(v) : String(v)} />
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Items ({data.order_items.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 pr-4 font-medium text-right">Unit price</th>
                <th className="py-2 pr-4 font-medium text-right">Qty</th>
                <th className="py-2 font-medium text-right">Line total</th>
              </tr>
            </thead>
            <tbody>
              {data.order_items.map((i) => (
                <tr key={i.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    {i.product_name}
                    {(i.size || i.color) && (
                      <span className="text-xs text-muted-foreground"> · {[i.size, i.color].filter(Boolean).join(" / ")}</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{formatPrice(i.unit_price)}</td>
                  <td className="py-2 pr-4 text-right">{i.quantity}</td>
                  <td className="py-2 text-right tabular-nums">{formatPrice(i.unit_price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;

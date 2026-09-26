"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils/currency";
import { ORDER_STATUSES, PAYMENT_METHOD_LABEL, STATUS_LABEL } from "@/lib/admin/orders";

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
  pending_payment: "bg-gray-100 text-gray-700 ring-gray-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  processing: "bg-amber-50 text-amber-800 ring-amber-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-green-50 text-green-700 ring-green-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const Panel = ({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
    <header className="flex items-center justify-between gap-3 px-5 py-4 border-b">
      <h2 className="text-sm font-semibold">{title}</h2>
      {aside}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const Field = ({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) => (
  <div>
    <dt className="text-xs text-muted-foreground mb-1">{label}</dt>
    <dd className={`text-sm font-medium break-words ${mono ? "font-mono text-[13px]" : ""}`}>{children}</dd>
  </div>
);

const Fact = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="px-5 py-4">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-base font-semibold tabular-nums">{value}</p>
  </div>
);

const SumRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
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
  if (error || !data) return <p className="p-6">Order not found.</p>;

  const a = data.shipping_address || {};
  const cityLine = [a.city, a.state, a.pincode].filter(Boolean).join(", ");
  const units = data.order_items.reduce((n, i) => n + i.quantity, 0);
  const isCod = data.payment_method === "cod";
  const method = PAYMENT_METHOD_LABEL[data.payment_method] || data.payment_method;
  const gateway = data.payment_method === "airpay" ? "Airpay" : "Razorpay";
  const phone = data.guest_phone || a.phone;
  const initial = (a.name || data.guest_email || "?").trim().charAt(0).toUpperCase();
  const placed = new Date(data.created_at);

  return (
    <div className="px-4 sm:px-6 py-5 sm:py-6 space-y-6">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight font-mono">{data.order_number}</h1>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${badge[data.status] || "bg-gray-100 ring-gray-200"}`}>
            {STATUS_LABEL[data.status] || data.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 rounded-xl border bg-white shadow-sm overflow-hidden">
        <Fact label="Order total" value={formatPrice(data.total)} />
        <Fact label="Items" value={`${units} ${units === 1 ? "unit" : "units"}`} />
        <Fact label="Payment" value={method} />
        <Fact
          label="Placed on"
          value={placed.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
        <Panel title={`Items (${data.order_items.length})`}>
          <ul className="-my-5 divide-y">
            {data.order_items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-5">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-surface-1">
                  {i.product_image && <Image src={i.product_image} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{i.product_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPrice(i.unit_price)} × {i.quantity}
                    {(i.size || i.color) && ` · ${[i.size, i.color].filter(Boolean).join(" / ")}`}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPrice(i.unit_price * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5 -mx-5 -mb-5 px-5 py-4 bg-surface-1 border-t space-y-2">
            <SumRow label="Subtotal" value={formatPrice(data.subtotal)} />
            {data.discount > 0 && <SumRow label="Discount" value={`−${formatPrice(data.discount)}`} />}
            <SumRow label="Shipping" value={data.shipping_fee ? formatPrice(data.shipping_fee) : "Free"} />
            {data.cod_fee > 0 && <SumRow label="COD fee" value={formatPrice(data.cod_fee)} />}
            <div className="flex justify-between items-baseline pt-3 mt-1 border-t">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-xl font-semibold tabular-nums">{formatPrice(data.total)}</span>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Update status">
            <div className="space-y-3">
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
                <p className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs leading-relaxed text-amber-800">
                  This online order has not been paid yet. Only confirm it manually after checking the payment in {gateway}.
                </p>
              )}
            </div>
          </Panel>

          <Panel title="Customer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
                {initial}
              </div>
              <p className="text-sm font-semibold">{a.name || "—"}</p>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="break-all">{data.guest_email || "—"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{phone || "—"}</span>
              </div>
            </dl>
          </Panel>

          <Panel title="Delivery">
            <dl className="space-y-4">
              <Field label="Ship to">
                {a.street && <span className="block">{a.street}</span>}
                {a.post_office && <span className="block">{a.post_office}</span>}
                {cityLine && <span className="block">{cityLine}</span>}
                {!a.street && !cityLine && "—"}
              </Field>
              {data.notes && <Field label="Customer notes">{data.notes}</Field>}
            </dl>
          </Panel>

          <Panel title="Payment">
            <dl className="space-y-4">
              <Field label="Method">{method}</Field>
              {!isCod && (
                <>
                  <Field label="Payment ID" mono>{data.payment_id || "—"}</Field>
                  <Field label={`${gateway} order`} mono>{data.razorpay_order_id || "—"}</Field>
                </>
              )}
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

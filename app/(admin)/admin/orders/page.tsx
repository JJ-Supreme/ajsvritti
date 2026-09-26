"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import TitleHeader from "../../_components/title-header";
import Pager from "../../_components/pager";
import Spinner from "@/components/Spinner";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils/currency";
import { ORDER_STATUSES, STATUS_LABEL } from "@/lib/admin/orders";

type Row = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  payment_method: string;
  guest_email: string | null;
  guest_phone: string | null;
  shipping_address: { name?: string } | null;
  created_at: string;
  order_items: { quantity: number }[];
};

const badge: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading, error } = useQuery<{ orders: Row[]; total: number; totalPages: number }>({
    queryKey: ["admin-orders", search, status, page],
    queryFn: async () => (await axios.get("/api/admin/orders", { params: { q: search, status, page } })).data,
  });

  return (
    <div className="p-3 sm:p-4 mt-2">
      <TitleHeader title="Orders" count={data?.total} description="View and manage customer orders" />
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search order number, email or phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-surface-1 px-3 text-sm"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Spinner />
      ) : error || !data ? (
        <p>Something went wrong!</p>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-gray-700 border-b bg-surface-1">
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Payment</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Total</th>
                <th className="p-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-surface-1">
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-primary hover:underline font-mono">
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="p-3">
                    <p>{o.shipping_address?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{o.guest_email || o.guest_phone}</p>
                  </td>
                  <td className="p-3">{o.order_items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="p-3 uppercase text-xs">{o.payment_method}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge[o.status] || "bg-gray-100"}`}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                  <td className="p-3 text-right text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {data.orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pager page={page} totalPages={data.totalPages} onChange={setPage} />}
    </div>
  );
};

export default OrdersPage;

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CreditCard, IndianRupee, Package, Users } from "lucide-react";
import TitleHeader from "../_components/title-header";
import SalesChart from "../_components/sales-chart";
import Spinner from "@/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/currency";
import { STATUS_LABEL } from "@/lib/admin/orders";

type Stats = {
  revenue: number;
  salesCount: number;
  orderCount: number;
  pendingPaymentCount: number;
  productCount: number;
  customerCount: number;
  chart: { date: string; revenue: number; orders: number }[];
  recentOrders: {
    id: string;
    order_number: string;
    status: string;
    total: number;
    customer: string;
    created_at: string;
  }[];
};

const AdminPage = () => {
  const { data, isLoading, error } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => (await axios.get("/api/admin/stats")).data,
  });

  if (isLoading) return <div className="p-8"><Spinner /></div>;
  if (error || !data) return <p className="p-4">Could not load the dashboard.</p>;

  const cards = [
    { title: "Revenue", value: formatPrice(data.revenue), icon: IndianRupee, note: "Confirmed to delivered orders" },
    { title: "Sales", value: `+${data.salesCount}`, icon: CreditCard, note: `${data.orderCount} orders placed` },
    { title: "Products", value: String(data.productCount), icon: Package, note: "In the catalog" },
    { title: "Customers", value: String(data.customerCount), icon: Users, note: "From your orders" },
  ];

  return (
    <div className="p-3 sm:p-4 mt-2 w-full lg:w-5/6 mx-auto">
      <TitleHeader title="Dashboard" description="Overview of your store" />
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pl-6 pb-3">
              <div className="text-2xl font-bold tabular-nums">{c.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Sales — last 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={data.chart} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent orders</CardTitle>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="py-2 pr-4 font-medium">Order</th>
                  <th className="py-2 pr-4 font-medium">Customer</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium text-right">Total</th>
                  <th className="py-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <Link href={`/admin/orders/${o.id}`} className="text-primary hover:underline font-mono">
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{o.customer}</td>
                    <td className="py-2 pr-4">{STATUS_LABEL[o.status] || o.status}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{formatPrice(o.total)}</td>
                    <td className="py-2 text-right text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;

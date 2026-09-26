"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import TitleHeader from "../../_components/title-header";
import Spinner from "@/components/Spinner";
import { formatPrice } from "@/lib/utils/currency";

type Customer = { name: string; email: string; phone: string; orders: number; spent: number; lastOrder: string };

const CustomersPage = () => {
  const { data, isLoading, error } = useQuery<{ customers: Customer[]; total: number }>({
    queryKey: ["admin-customers"],
    queryFn: async () => (await axios.get("/api/admin/customers")).data,
  });

  return (
    <div className="p-3 sm:p-4 mt-2">
      <TitleHeader title="Customers" count={data?.total} description="People who have placed orders on this store" />
      {isLoading ? (
        <Spinner />
      ) : error || !data ? (
        <p>Something went wrong!</p>
      ) : (
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-gray-700 border-b bg-surface-1">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Phone</th>
                <th className="p-3 font-medium text-right">Orders</th>
                <th className="p-3 font-medium text-right">Total spent</th>
                <th className="p-3 font-medium text-right">Last order</th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((c, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="p-3">{c.name || "—"}</td>
                  <td className="p-3">{c.email || "—"}</td>
                  <td className="p-3">{c.phone || "—"}</td>
                  <td className="p-3 text-right">{c.orders}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(c.spent)}</td>
                  <td className="p-3 text-right text-muted-foreground">{new Date(c.lastOrder).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {data.customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No customers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

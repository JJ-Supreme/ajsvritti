"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Package, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import { formatPrice } from "@/lib/utils/currency";
import { TaxLines } from "@/components/order/tax-lines";
import { paymentMethodLabel, statusBadge } from "@/components/order/status";
import type { TaxBreakdown } from "@/lib/gst";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
  image: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  isPaid: boolean;
  paymentMethod: string;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  taxBreakdown: TaxBreakdown;
  createdAt: string;
  orderItems: OrderItem[];
};

const MyOrdersPage = () => {
  const router = useRouter();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/user/orders");
        return data as Order[];
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          router.push("/sign-in?redirect_url=/my-orders");
          return [];
        }
        throw err;
      }
    },
  });

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-red-500">Failed to load orders. Please try again.</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Package className="h-6 w-6 sm:h-8 sm:w-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
            <p className="text-gray-500 text-lg">No orders yet</p>
            <Button onClick={() => router.push("/shop")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = statusBadge(order.status);
              return (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start gap-3 sm:gap-4 mb-4 pb-4 border-b">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-gray-500">
                        Order placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Order number: <span className="font-mono">{order.orderNumber}</span>
                      </p>
                      <Link
                        href={`/track-order?order=${encodeURIComponent(order.orderNumber)}`}
                        className="inline-block text-xs sm:text-sm font-medium text-primary hover:underline"
                      >
                        Track order
                      </Link>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2 text-xs sm:text-sm">
                      <span className="flex flex-wrap items-center gap-1">
                        <span className="text-gray-600">Status: </span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-1">
                        <span className="text-gray-600">Payment: </span>
                        <span
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                            order.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.isPaid ? "PAID" : order.status === "cancelled" ? "CANCELLED" : "UNPAID"}
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-1">
                        <span className="text-gray-600">Method: </span>
                        <span className="text-gray-600">{paymentMethodLabel(order.paymentMethod)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3 mb-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3 sm:gap-4 items-center hover:bg-gray-50 p-2 rounded">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">{item.productName}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-gray-600">
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <span className="font-medium tabular-nums">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <TaxLines tax={order.taxBreakdown} total={order.totalAmount} />

                  {/* Delivery Address */}
                  <div className="pt-3 mt-3 border-t">
                    <p className="text-xs sm:text-sm text-gray-600">Delivery Address:</p>
                    <p className="text-xs sm:text-sm font-medium break-words">{order.address}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
};

export default MyOrdersPage;

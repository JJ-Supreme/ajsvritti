"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Package, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Container from "@/components/ui/container";
import { getDisplayGst } from "@/lib/gst";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
  product: {
    id: string;
    title: string;
    imageIds: string[];
  };
};

type Order = {
  id: string;
  isPaid: boolean;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  orderStatus?: 'PENDING' | 'DELIVERED' | 'CANCELLED' | 'ON-HOLD';
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "text-green-600 bg-green-50";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50";
      case "ON-HOLD":
        return "text-gray-600 bg-gray-50";
      case "CANCELLED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cod":
        return "Cash on Delivery";
      case "cashfree":
      case "razorpay":
        return "Online Payment";
      default:
        return method;
    }
  };

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
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 sm:p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start gap-3 sm:gap-4 mb-4 pb-4 border-b">
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm text-gray-500">
                      Order placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Order ID: <span className="font-mono">{order.id.slice(0, 8)}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <span className="flex flex-wrap items-center gap-1">
                      <span className="text-gray-600">Delivery: </span>
                      <span
                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.orderStatus || 'PENDING'
                        )}`}
                      >
                        {(order.orderStatus || 'PENDING').toUpperCase()}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1">
                      <span className="text-gray-600">Payment: </span>
                      <span
                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          order.isPaid || (order.paymentStatus || '').toUpperCase() === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.isPaid || (order.paymentStatus || '').toUpperCase() === 'PAID' ? 'PAID' : 'UNPAID'}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1">
                      <span className="text-gray-600">Method: </span>
                      <span className="text-gray-600">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 sm:gap-4 items-center hover:bg-gray-50 p-2 rounded"
                    >
                      {item.product?.imageIds?.[0] && (
                        <img
                          src={item.product.imageIds[0]}
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
                          <span className="font-medium tabular-nums">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charge Breakdown */}
                {(() => {
                  const subtotal = order.orderItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  const gst = getDisplayGst(subtotal);
                  return (
                    <div className="pt-4 border-t space-y-2 text-sm">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-gray-500">
                          <span className="truncate mr-4">
                            {item.productName} x {item.quantity}
                          </span>
                          <span className="tabular-nums shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-gray-600 pt-1 border-t border-dashed">
                        <span>Base Amount</span>
                        <span className="tabular-nums">₹{subtotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>(+) IGST: 18.00%</span>
                        <span className="tabular-nums">₹{gst.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Total</span>
                        <span className="tabular-nums">₹{(subtotal + gst).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>(−) Discount</span>
                        <span className="tabular-nums">−₹{gst.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base pt-1 border-t">
                        <span>Grand Total</span>
                        <span className="tabular-nums">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Delivery Address */}
                <div className="pt-3 mt-1">
                  <p className="text-xs sm:text-sm text-gray-600">Delivery Address:</p>
                  <p className="text-xs sm:text-sm font-medium break-words">{order.address}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default MyOrdersPage;

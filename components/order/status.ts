export const TIMELINE_STEPS = ["Order Placed", "Confirmed", "Processing", "Shipped", "Delivered"] as const;

// How many timeline steps are genuinely complete for a status. Nothing beyond
// "Order Placed" is ever shown as done until the order's status says so.
export function completedSteps(status: string): number {
  switch (status) {
    case "confirmed":
      return 2;
    case "processing":
      return 3;
    case "shipped":
      return 4;
    case "delivered":
      return 5;
    default: // pending_payment, cancelled, unknown
      return 1;
  }
}

export function statusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case "delivered":
      return { label: "DELIVERED", className: "text-green-700 bg-green-50" };
    case "shipped":
      return { label: "SHIPPED", className: "text-blue-700 bg-blue-50" };
    case "processing":
      return { label: "PROCESSING", className: "text-indigo-700 bg-indigo-50" };
    case "confirmed":
      return { label: "CONFIRMED", className: "text-emerald-700 bg-emerald-50" };
    case "cancelled":
      return { label: "CANCELLED", className: "text-red-700 bg-red-50" };
    case "pending_payment":
      return { label: "AWAITING PAYMENT", className: "text-yellow-700 bg-yellow-50" };
    default:
      return { label: status.toUpperCase(), className: "text-gray-700 bg-gray-50" };
  }
}

export function paymentMethodLabel(method: string) {
  if (method === "cod") return "Cash on Delivery";
  if (method === "razorpay" || method === "cashfree") return "Online Payment";
  return method;
}

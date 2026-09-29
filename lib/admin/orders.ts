// Order status contract (lowercase in the DB), shared with the storefront.
export const ORDER_STATUSES = [
  "pending_payment",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Statuses that count as real revenue on the dashboard.
export const REVENUE_STATUSES: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered"];

export const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// payment_method values stored on orders. `razorpay_order_id` doubles as the gateway
// order id for Airpay orders (same column, no schema change).
export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  razorpay: "Online (Razorpay)",
  airpay: "Online (Airpay)",
};

export const PAYMENT_SHORT_LABEL: Record<string, string> = {
  cod: "COD",
  razorpay: "Razorpay",
  airpay: "Airpay",
};

// Orders can be stored with a created_at in the future (scheduled logs). They stay
// invisible in the admin until that moment passes: every admin query filters on the
// server clock at request time, so nothing needs to run on a schedule.
export const visibleUntilNow = () => new Date().toISOString();

import Image from "next/image";

import useCart, { type CartItem } from "@/hooks/use-cart";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils/currency";
import { getBulkDiscountLabel } from "@/lib/utils/pricing";
import { X, Plus, Minus } from "lucide-react";

interface CartItemProps {
  data: CartItem;
}

const CartItem: React.FC<CartItemProps> = ({ data }) => {
  const cart = useCart();

  const onRemoveAll = () => {
    cart.removeAll(data);
  };

  const onRemove = () => {
    cart.removeItem(data);
  };

  const onAdd = () => {
    cart.addItem(data);
  };

  // Format price from integer to INR
  const formatLocalPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <li className="flex py-6 border-b border-border">
      <div className="relative h-24 w-24 rounded-lg overflow-hidden sm:h-48 sm:w-48 bg-surface-1">
        <Image
          fill
          unoptimized
          src={data.image || "/placeholder.png"}
          alt={data.title}
          className="object-cover object-center"
        />
      </div>
      <div className="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="absolute z-10 right-0 top-0">
          <button
            onClick={onRemoveAll}
            className="rounded-lg flex items-center justify-center bg-white border border-border shadow-soft-sm p-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
            aria-label="Remove item"
          >
            <X size={16} />
          </button>
        </div>
        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
          <div className="flex justify-between">
            <p className="text-base font-semibold text-foreground">{data.title}</p>
          </div>

          <div className="mt-1 flex text-sm">
            <p className="text-muted-foreground">{data.category}</p>
          </div>
          {(data.size || data.selectedColor) && (
            <div className="mt-1 flex gap-3 text-sm text-muted-foreground">
              {data.size && <span>Size: {data.size}</span>}
              {data.selectedColor && <span>Color: {data.selectedColor}</span>}
            </div>
          )}
          <div className="flex flex-col mt-3 gap-y-3 max-md:flex-row max-md:justify-between max-md:items-center">
            <div className="flex items-center gap-2">
              <p className="text-lg text-foreground font-semibold tabular-nums">
                {data.totalPrice
                  ? formatLocalPrice(data.totalPrice)
                  : formatLocalPrice(data.price)}
              </p>
              {getBulkDiscountLabel(data.quantity) && (
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                  {getBulkDiscountLabel(data.quantity)}
                </span>
              )}
            </div>
            <div className="flex max-md:justify-end w-full">
              <div className="border border-border w-32 rounded-lg p-1 gap-2 flex justify-between items-center bg-surface-1">
                <button
                  onClick={onRemove}
                  className="p-1.5 rounded-md hover:bg-white hover:shadow-soft-sm text-primary transition-all duration-200"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <p className="font-semibold text-foreground tabular-nums">{data.quantity}</p>
                <button
                  onClick={onAdd}
                  className="p-1.5 rounded-md hover:bg-white hover:shadow-soft-sm text-primary transition-all duration-200"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default CartItem;

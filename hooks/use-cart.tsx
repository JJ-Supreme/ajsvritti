import { create } from "zustand";
import { toast } from "react-hot-toast";
import { persist, createJSONStorage } from "zustand/middleware";

import { Product } from "@/types";
import { getBulkUnitPrice } from "@/lib/utils/pricing";
import { MAX_QTY_PER_ITEM } from "@/lib/constants";

export interface CartItem extends Product {
  quantity: number;
  totalPrice?: number;
  selectedColor?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (data: Product) => void;
  removeItem: (data: Product) => void;
  removeAll: (data: Product) => void;
  removeAllCart: () => void;
}

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      addItem: (data: Product) => {
        const currentItems = get().items;

        const existingItem = currentItems.findIndex(
          (item) =>
            item.id === data.id &&
            item.size === data.size &&
            item.selectedColor === data.selectedColor
        );

        if (existingItem !== -1) {
          if (currentItems[existingItem].quantity >= MAX_QTY_PER_ITEM) {
            toast.error("Maximum quantity per item reached");
            return;
          }
          const updatedItems = [...currentItems];
          const newQty = updatedItems[existingItem].quantity + 1;
          updatedItems[existingItem].quantity = newQty;
          updatedItems[existingItem].totalPrice =
            newQty * getBulkUnitPrice(data.price, newQty);

          set({ items: updatedItems });
          toast.success("Item added to cart.");
        } else {
          set({
            items: [
              ...currentItems,
              {
                ...data,
                quantity: 1,
                totalPrice: data.price,
              },
            ],
          });
          toast.success("Item added to cart.");
        }
      },
      removeItem: (data: Product) => {
        const currentItems = get().items;
        const existingItemIndex = currentItems.findIndex(
          (item) =>
            item.id === data.id &&
            item.size === data.size &&
            item.selectedColor === data.selectedColor
        );

        if (existingItemIndex !== -1) {
          const updatedItems = [...currentItems];
          if (updatedItems[existingItemIndex].quantity > 1) {
            const newQty = updatedItems[existingItemIndex].quantity - 1;
            updatedItems[existingItemIndex].quantity = newQty;
            updatedItems[existingItemIndex].totalPrice =
              newQty * getBulkUnitPrice(data.price, newQty);
          } else {
            updatedItems.splice(existingItemIndex, 1);
          }
          set({ items: updatedItems });
          toast.success("Item removed from cart.");
        }
      },
      removeAll: (data: Product) => {
        const currentItems = get().items;
        const remainingItems = currentItems.filter(
          (item) =>
            !(
              item.id === data.id &&
              item.size === data.size &&
              item.selectedColor === data.selectedColor
            )
        );
        set({ items: remainingItems });
        toast.success("Item removed from cart.");
      },
      removeAllCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;

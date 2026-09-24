"use client";

import { useEffect, useState } from "react";

import useCart from "@/hooks/use-cart";
import CartItem from "./_components/cart-item";
import Footer from "@/components/footer";
import { ShoppingCart } from "lucide-react";
import Summary from "./_components/summary";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CartPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="py-6 sm:py-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Shopping Cart</h1>
          {cart.items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <ShoppingCart className="h-24 w-24 text-muted-foreground/20" strokeWidth={1} />
              <p className="text-muted-foreground">Your cart is empty.</p>
              <Link
                href="/shop"
                className="text-sm font-medium text-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          )}
          <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
            <div className="lg:col-span-7">
              <ul>
                {cart.items.map((item, index) => (
                  <CartItem key={index} data={item} />
                ))}
              </ul>
            </div>
            {cart.items.length > 0 && <Summary />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;

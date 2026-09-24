"use client";

import { useRouter } from "next/navigation";
import { Package, ShoppingCart } from "lucide-react";
import useCart from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/use-auth-user";
import { Button } from "@/components/ui/button";

const NavbarActions = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isSignedIn } = useAuthUser();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const router = useRouter();
  const cart = useCart();

  if (!isMounted) {
    return null;
  }

  const filteredShop = cart?.items?.map((item) => item.quantity);
  const shopCount = filteredShop?.reduce((a, b) => {
    return a + b;
  }, 0);

  // Redesign for Light Background Header
  return (
    <div className="flex items-center gap-x-1">
      {isSignedIn && (
        <Button
          onClick={() => router.push("/my-orders")}
          variant="ghost"
          size="sm"
          className="flex flex-col gap-0 h-auto py-1 px-2 text-foreground"
        >
          <Package size={20} />
          <span className="text-[10px] font-medium">Orders</span>
        </Button>
      )}
      
      <Button
        onClick={() => router.push("/cart")}
        variant="ghost" 
        size="sm"
        className="flex flex-col gap-0 h-auto py-1 px-3 text-foreground relative"
      >
        <div className="relative">
          <ShoppingCart size={22} />
          {shopCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
              {shopCount > 9 ? "9+" : shopCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium mt-0.5">Cart</span>
      </Button>
    </div>
  );
};

export default NavbarActions;

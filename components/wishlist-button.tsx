"use client";

import { MouseEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import useWishlist from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
  label?: boolean;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ productId, className, size = 16, label }) => {
  const router = useRouter();
  const pathname = usePathname();
  const load = useWishlist((s) => s.load);
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const result = await toggle(productId);
    setBusy(false);
    if (result === "auth") {
      const here = typeof window !== "undefined" ? window.location.pathname + window.location.search : pathname;
      router.push(`/sign-in?redirect_url=${encodeURIComponent(here)}`);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn("inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60", className)}
    >
      <Heart size={size} className={cn(active ? "fill-red-500 text-red-500" : "text-foreground")} />
      {label && <span className="text-xs">{active ? "Wishlisted" : "Wishlist"}</span>}
    </button>
  );
};

export default WishlistButton;

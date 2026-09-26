"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import Footer from "@/components/footer";
import Container from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import useWishlist from "@/hooks/use-wishlist";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

const WishlistPage = () => {
  const router = useRouter();
  const cart = useCart();
  const ids = useWishlist((s) => s.ids);
  const toggle = useWishlist((s) => s.toggle);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/wishlist?full=1", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/sign-in?redirect_url=/wishlist");
          return;
        }
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        if (!cancelled) {
          setProducts(data.products || []);
          useWishlist.setState({ ids: data.ids || [], signedIn: true, loaded: true });
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const visible = (products || []).filter((p) => ids.includes(p.id));

  return (
    <div className="bg-white">
      <Container>
        <div className="py-6 sm:py-8 min-h-[70vh]">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">My Wishlist</h1>

          {error && <p className="mt-8 text-sm text-destructive">We could not load your wishlist. Please refresh the page.</p>}

          {!error && products === null && (
            <div className="flex justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {products !== null && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <Heart className="h-20 w-20 text-muted-foreground/20" strokeWidth={1} />
              <p className="text-muted-foreground">Your wishlist is empty.</p>
              <Link href="/shop" className="text-sm font-medium text-primary hover:underline">
                Continue Shopping
              </Link>
            </div>
          )}

          {visible.length > 0 && (
            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((product) => (
                <li key={product.id} className="border border-border rounded-lg overflow-hidden flex flex-col bg-white">
                  <Link href={`/product/${product.id}`} className="block aspect-square bg-surface-1 p-4 relative">
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.title}
                      fill
                      unoptimized
                      className="object-contain p-4"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
                    <Link href={`/product/${product.id}`} className="text-sm font-medium text-foreground hover:text-primary line-clamp-2 min-h-[2.5em]">
                      {product.title}
                    </Link>
                    <p className="mt-2 font-semibold text-foreground tabular-nums">{formatPrice(product.price)}</p>
                    <div className="mt-4 flex gap-2 pt-3 border-t border-border/50">
                      <Button className="flex-1" size="sm" onClick={() => cart.addItem(product)}>
                        <ShoppingCart size={14} className="mr-2" /> Add to Cart
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggle(product.id)} aria-label="Remove from wishlist">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default WishlistPage;

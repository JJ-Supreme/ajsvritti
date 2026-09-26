"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types";
import { MouseEventHandler } from "react";
import useCart from "@/hooks/use-cart";
import { ShoppingCart } from "lucide-react";
import WishlistButton from "@/components/wishlist-button";

interface ProductCard {
  data: Product;
}

const ProductCard: React.FC<ProductCard> = ({ data }) => {
  const router = useRouter();
  const cart = useCart();

  const handleClick = () => {
    router.push(`/product/${data?.id}`);
  };

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    cart.addItem(data);
  };

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.png';
    const httpsIndex = url.indexOf('https://', 1);
    const httpIndex = url.indexOf('http://', 1);
    if (httpsIndex > 0) url = url.substring(httpsIndex);
    else if (httpIndex > 0) url = url.substring(httpIndex);

    if (url.includes('images.meesho.com')) {
      url = url.replace(/\?width=\d+/, '');
      url = url.replace(/_512\./, '_1200.');
    }
    return url;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white group cursor-pointer border border-border hover:border-primary/30 hover:shadow-soft-lg transition-all duration-300 flex flex-col h-full rounded-lg overflow-hidden"
    >
      {/* Image */}
      <div className="aspect-square bg-surface-1 p-3 sm:p-5 relative overflow-hidden">
        <Image
          src={getImageUrl(data.image)}
          alt={data.title}
          fill
          unoptimized
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        <WishlistButton
          productId={data.id}
          className="absolute top-3 right-3 bg-white/90 border border-border rounded-full p-2 shadow-soft-sm hover:bg-white"
        />
        {/* Add to Cart overlay — visible on hover (always on mobile) */}
        <button
          onClick={onAddToCart}
          className="absolute bottom-3 right-3 bg-primary text-white p-2.5 rounded-lg shadow-soft-md sm:opacity-0 sm:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-primary/90"
          title="Add to Cart"
          aria-label="Add to cart"
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
          {data.category}
        </p>

        <h3 className="text-xs sm:text-sm font-medium text-foreground leading-snug mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5em]">
          {data.title}
        </h3>

        {/* Price */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-border/50">
          <div className="font-semibold text-foreground text-sm sm:text-base tabular-nums">
            {formatPrice(data.price)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

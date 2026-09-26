"use client";

import { getCategoryProducts } from "@/lib/apiCalls";
import { Product } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PriceInputProps = {
  data: Product[];
};

const PriceInput = ({ data }: PriceInputProps) => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Bounds start from the real catalog prices (no 0-0 slider flash before the effect runs).
  const initialPrices = data.map((p) => Number(p.price)).filter((n) => Number.isFinite(n));
  const initialMin = initialPrices.length ? Math.min(...initialPrices) : 0;
  const initialMax = initialPrices.length ? Math.max(...initialPrices) : 0;
  const initialParam = Number(searchParams.get("price"));

  const [minPrice, setMinPrice] = useState<number>(initialMin);
  const [maxPrice, setMaxPrice] = useState<number>(initialMax);
  const [value, setValue] = useState<number>(
    searchParams.get("price") && !isNaN(initialParam) ? initialParam : initialMax
  );

  const handleSortChange = useCallback(
    async (value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      if (!value || +value === maxPrice) {
        current.delete("price");
      } else {
        current.set("price", value);
      }
      const search = current.toString();
      const query = search ? `?${search}` : "";

      await router.replace(`${pathName}${query}`);
    },
    [searchParams, pathName, router, maxPrice]
  );

  useEffect(() => {
    const fetchProductPrice = async () => {
      let products = data;
      
      if (pathName.startsWith("/shop/") && pathName !== "/shop") {
        const urlString = pathName.substring("/shop/".length);
        const categoryData = await getCategoryProducts(urlString);
        products = categoryData || [];
      }
      
      if (products && products.length > 0) {
        const prices = products.map((product: Product) => {
          return parseFloat(product.price.toString());
        });
        
        const max = Math.max(...prices);
        const min = Math.min(...prices);
        
        setMaxPrice(max);
        setMinPrice(min);

        const priceParam = searchParams.get("price");
        if (priceParam && !isNaN(Number(priceParam))) {
          setValue(Number(priceParam));
        } else {
          setValue(max);
        }
      }
    };

    fetchProductPrice();
  }, [pathName, data, searchParams]);

  return (
    <div className="mt-2">
      <div className="flex justify-between items-baseline mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Price</p>
        <span className="text-sm font-semibold tabular-nums text-foreground">₹{value?.toLocaleString('en-IN')}</span>
      </div>
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={value || 0}
        step="1"
        onChange={(e) => {
          handleSortChange(e.target.value);
          setValue(parseFloat(e.target.value));
        }}
        className="accent-primary w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer"
        aria-label="Price filter"
      />
    </div>
  );
};

export default PriceInput;

"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const SortItems = () => {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedSort, setSelectedSort] = useState<string>("Relevance");

  const handleSortChange = useCallback(
    async (value: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      if (!value || value === "Relevance") {
        current.delete("sort");
      } else {
        current.set("sort", value);
      }
      const search = current.toString();
      const query = search ? `?${search}` : "";

      await router.replace(`${pathName}${query}`);

      setSelectedSort(value);
    },
    [searchParams, pathName, router]
  );

  useEffect(() => {
    handleSortChange(selectedSort);
  }, [selectedSort, handleSortChange]);

  return (
    <div className="flex items-center justify-end mb-6 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        <label htmlFor="sort-select" className="text-sm text-muted-foreground">Sort by</label>
        <select
          id="sort-select"
          className="border border-border rounded-lg px-3 py-2 text-sm bg-surface-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all duration-200"
          name="sorting"
          value={selectedSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="">Relevance</option>
          <option value="latest-arrivals">Latest arrivals</option>
          <option value="price-low-to-high">Low to high</option>
          <option value="price-high-to-low">High to low</option>
        </select>
      </div>
    </div>
  );
};

export default SortItems;

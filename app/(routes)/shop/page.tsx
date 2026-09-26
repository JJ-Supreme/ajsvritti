import ProductCard from "@/components/ui/product-card";
import Pagination from "@/components/ui/pagination";
import {
  getAllProductsPaginatedFromDB,
  getAllProductsPrioritizedFromDB,
  DEFAULT_ITEMS_PER_PAGE,
} from "@/lib/serverDataAccess";
import filteredData from "@/app/utils/filteredData";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop",
  description:
    "Browse IT hardware, cables, adapters, networking equipment, computer accessories and power protection products from AJS Vritti Vision Marketing.",
};

const ShopPage = async ({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}) => {
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

  // Check if any filters are applied (except page)
  const hasFilters = searchParams.sort || searchParams.price || searchParams.q ||
    searchParams.topLevelCategory || searchParams.category || searchParams.parentCategory ||
    searchParams.new || searchParams.featured || searchParams.deals;

  let products: Product[];
  let totalCount: number;

  if (hasFilters) {
    // When filters are applied, fetch all and filter in memory
    console.log('[ShopPage] Fetching all products for filtering...');
    const allData = await getAllProductsPrioritizedFromDB();
    const filtered = filteredData(searchParams, allData);
    totalCount = filtered.length;

    // Paginate filtered results
    const offset = (currentPage - 1) * itemsPerPage;
    products = filtered.slice(offset, offset + itemsPerPage);
  } else {
    // No filters - use database-level pagination
    console.log('[ShopPage] Fetching paginated products...');
    const paginatedResult = await getAllProductsPaginatedFromDB(currentPage, itemsPerPage);
    products = paginatedResult.data;
    totalCount = paginatedResult.totalCount;
  }

  console.log('[ShopPage] Products to display:', products.length, 'of', totalCount);

  // Handle empty results
  if (totalCount === 0) {
    if (searchParams.q) {
      return (
        <p className="text-base text-muted-foreground">
          There are no products that match{" "}
          <span className="font-bold">{`"${searchParams.q}"`}</span>
        </p>
      );
    }
    if (searchParams.topLevelCategory) {
      return (
        <p className="text-base text-muted-foreground">
          No products found in{" "}
          <span className="font-bold">{searchParams.topLevelCategory}</span>
        </p>
      );
    }
    if (searchParams.category) {
      return (
        <p className="text-base text-muted-foreground">
          No products found in{" "}
          <span className="font-bold">{searchParams.category}</span>
        </p>
      );
    }
  }

  // Build search message
  let searchMsg = null;
  if (searchParams.q && totalCount > 0) {
    searchMsg = (
      <p className="text-base text-muted-foreground mb-3">
        Showing {totalCount} results for{" "}
        <span className="font-bold">{`"${searchParams.q}"`}</span>
      </p>
    );
  } else if (searchParams.topLevelCategory) {
    searchMsg = (
      <p className="text-base text-muted-foreground mb-3">
        Showing {totalCount} products in{" "}
        <span className="font-bold">{searchParams.topLevelCategory}</span>
      </p>
    );
  } else if (searchParams.category) {
    searchMsg = (
      <p className="text-base text-muted-foreground mb-3">
        Showing {totalCount} products in{" "}
        <span className="font-bold">{searchParams.category}</span>
      </p>
    );
  } else if (searchParams.deals === "true") {
    searchMsg = (
      <p className="text-base text-muted-foreground mb-3">
        Showing {totalCount} products in{" "}
        <span className="font-bold">Today&apos;s Deals</span>
      </p>
    );
  } else if (searchParams.new === "true") {
    searchMsg = (
      <p className="text-base text-muted-foreground mb-3">
        Showing {totalCount} products in{" "}
        <span className="font-bold">New Arrivals</span>
      </p>
    );
  } else if (searchParams.featured === "true") {
    searchMsg = (
      <p className="text-base text-muted-foreground mb-3">
        Showing {totalCount} products in{" "}
        <span className="font-bold">Featured Products</span>
      </p>
    );
  }

  return (
    <>
      {searchMsg}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        {products.map((product: Product) => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>
      <Pagination
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
      />
    </>
  );
};

export default ShopPage;

import Container from "@/components/ui/container";
import Pagination from "@/components/ui/pagination";
import {
  getFeaturedProductsFromDB,
  getFeaturedProductsPaginatedFromDB,
  DEFAULT_ITEMS_PER_PAGE,
} from "@/lib/serverDataAccess";
import filteredData from "@/app/utils/filteredData";
import { Product } from "@/types";
import ProductCard from "@/components/ui/product-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Featured",
  description: `Featured products at AJS Vritti Vision Marketing - high-quality IT hardware and computer accessories.`,
};

const FeaturedPage = async ({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}) => {
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

  // Check if any filters are applied (except page)
  const hasFilters = searchParams.sort;

  let products: Product[];
  let totalCount: number;

  if (hasFilters) {
    // When filters are applied, fetch all and filter in memory
    console.log('[FeaturedPage] Fetching all featured products for filtering...');
    const allData = await getFeaturedProductsFromDB();
    const filtered = filteredData(searchParams, allData);
    totalCount = filtered.length;

    // Paginate filtered results
    const offset = (currentPage - 1) * itemsPerPage;
    products = filtered.slice(offset, offset + itemsPerPage);
  } else {
    // No filters - use database-level pagination
    console.log('[FeaturedPage] Fetching paginated featured products...');
    const paginatedResult = await getFeaturedProductsPaginatedFromDB(currentPage, itemsPerPage);
    products = paginatedResult.data;
    totalCount = paginatedResult.totalCount;
  }

  console.log('[FeaturedPage] Products to display:', products.length, 'of', totalCount);

  if (totalCount === 0) {
    return (
      <Container>
        <p className="font-serif text-lg">No featured products available.</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col gap-y-8 mt-2">
        <p className="font-serif text-lg">
          Showing {totalCount} featured products
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((product: Product) => (
            <ProductCard key={product.id} data={product} />
          ))}
        </div>
        <Pagination
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
        />
      </div>
    </Container>
  );
};

export default FeaturedPage;

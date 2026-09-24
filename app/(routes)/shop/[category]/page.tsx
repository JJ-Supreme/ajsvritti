import filteredData from "@/app/utils/filteredData";
import ProductCard from "@/components/ui/product-card";
import Pagination from "@/components/ui/pagination";
import { siteConfig } from "@/config/site";
import {
  getProductsByCategoryFromDB,
  getProductsByCategoryPaginatedFromDB,
  DEFAULT_ITEMS_PER_PAGE,
} from "@/lib/serverDataAccess";
import { Product } from "@/types";
import { type Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  console.log('[CategoryPage] Fetching metadata for category:', params.category);
  const data = await getProductsByCategoryFromDB(params.category);
  if (!data || data.length <= 0)
    return {
      title: "AJS Vritti Vision Marketing",
      description: "Your trusted destination for high-quality IT hardware and computer accessories.",
    };

  return {
    title: `${
      data[0]?.category?.[0]?.toUpperCase() + data[0]?.category?.slice(1)
    } | ${siteConfig.name}`,
    description: data[0]?.title,
  };
}

const CategoryPage = async ({
  params,
  searchParams,
}: {
  params: { category: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

  // Check if any filters are applied (except page)
  const hasFilters = searchParams.sort || searchParams.price;

  let products: Product[];
  let totalCount: number;

  if (hasFilters) {
    // When filters are applied, fetch all and filter in memory
    console.log('[CategoryPage] Fetching all products for filtering:', params.category);
    const allData = await getProductsByCategoryFromDB(params.category);
    const filtered = filteredData(searchParams, allData);
    totalCount = filtered.length;

    // Paginate filtered results
    const offset = (currentPage - 1) * itemsPerPage;
    products = filtered.slice(offset, offset + itemsPerPage);
  } else {
    // No filters - use database-level pagination
    console.log('[CategoryPage] Fetching paginated products for category:', params.category);
    const paginatedResult = await getProductsByCategoryPaginatedFromDB(
      params.category,
      currentPage,
      itemsPerPage
    );
    products = paginatedResult.data;
    totalCount = paginatedResult.totalCount;
  }

  console.log('[CategoryPage] Products to display:', products.length, 'of', totalCount);

  if (totalCount === 0) {
    return (
      <p className="font-serif text-lg">
        No products found in{" "}
        <span className="font-bold">{params.category}</span>
      </p>
    );
  }

  return (
    <>
      <p className="font-serif text-lg mb-3">
        Showing {totalCount} products in{" "}
        <span className="font-bold">
          {params.category.charAt(0).toUpperCase() + params.category.slice(1)}
        </span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
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

export default CategoryPage;

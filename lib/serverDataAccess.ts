/**
 * Server-side data access. Backed by the shared Supabase project
 * (products scoped by CLIENT_ID). Server Components only — client components
 * use lib/apiCalls.ts.
 */

import { Product, Category, ProductDetails } from "@/types";
import {
  getAllProducts,
  getProductById,
  getCategories,
  getProductDetailsBySku,
} from "@/lib/services/products";

function deduplicateByTitle(products: Product[]): Product[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    const key = p.title?.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isInvalidTitle(title: string): boolean {
  if (!title || title.length < 5) return true;
  if (/^\+\d+\s*More/i.test(title)) return true;
  if (/^\d+h\s*:\s*\d+m/i.test(title)) return true;
  if (/^[\d\s:hms]+$/i.test(title)) return true;
  if (/More\d*h\s*:/i.test(title)) return true;
  return false;
}

const byPriceDesc = (a: Product, b: Product) => b.price - a.price;

const byRatingThenReviews = (a: Product, b: Product) => {
  const ratingA = parseFloat(a.rating) || 0;
  const ratingB = parseFloat(b.rating) || 0;
  if (ratingB !== ratingA) return ratingB - ratingA;
  return b.reviewCount - a.reviewCount;
};

async function loadValid(): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => !isInvalidTitle(p.title))
    .map((p) => ({ ...p, hasDetails: true }));
}

export async function getAllProductsFromDB(): Promise<Product[]> {
  try {
    const products = await getAllProducts();
    return deduplicateByTitle([...products].sort(byPriceDesc));
  } catch (error) {
    console.error("[ServerDataAccess] Error fetching products:", error);
    return [];
  }
}

export async function getProductFromDB(productId: string): Promise<Product | null> {
  try {
    return await getProductById(productId);
  } catch (error) {
    console.error("[ServerDataAccess] Error fetching product:", error);
    return null;
  }
}

export async function getProductsByCategoryFromDB(category: string): Promise<Product[]> {
  const all = await getAllProductsFromDB();
  return all.filter((p) => p.category === category);
}

export async function getProductsByTopLevelCategoryFromDB(topLevelCategory: string): Promise<Product[]> {
  const all = await getAllProductsFromDB();
  return all.filter((p) => p.topLevelCategory === topLevelCategory);
}

export async function getAllCategoriesFromDB(): Promise<Category[]> {
  try {
    return await getCategories();
  } catch (error) {
    console.error("[ServerDataAccess] Error fetching categories:", error);
    return [];
  }
}

export async function getCategoriesByTopLevelFromDB(topLevelCategory: string): Promise<Category[]> {
  const cats = await getAllCategoriesFromDB();
  return cats.filter((c) => c.topLevelCategory === topLevelCategory);
}

export async function getFeaturedProductsFromDB(limit: number = 20): Promise<Product[]> {
  try {
    const valid = await loadValid();
    return deduplicateByTitle(valid.sort(byRatingThenReviews)).slice(0, limit);
  } catch (error) {
    console.error("[ServerDataAccess] Error fetching featured products:", error);
    return [];
  }
}

export async function getWomenProductsFromDB(limit: number = 20): Promise<Product[]> {
  const valid = await loadValid();
  return deduplicateByTitle(
    valid.filter((p) => p.topLevelCategory === "Women Western").sort(byRatingThenReviews)
  ).slice(0, limit);
}

export async function getProductCategoriesFromDB(): Promise<string[]> {
  const all = await getAllProducts();
  return Array.from(new Set(all.map((p) => p.category).filter(Boolean))).sort();
}

export async function getTopLevelCategoriesFromDB(): Promise<string[]> {
  const all = await getAllProducts();
  return Array.from(new Set(all.map((p) => p.topLevelCategory).filter(Boolean))).sort();
}

export async function getProductDetailsFromDB(productId: string): Promise<ProductDetails | null> {
  try {
    return await getProductDetailsBySku(productId);
  } catch (error) {
    console.error("[ServerDataAccess] Error fetching product details:", error);
    return null;
  }
}

export async function getProductIdsWithDetailsFromDB(): Promise<string[]> {
  const all = await getAllProducts();
  return all.map((p) => p.productId);
}

export async function getAllProductsPrioritizedFromDB(): Promise<Product[]> {
  try {
    const valid = await loadValid();
    return deduplicateByTitle(valid.sort(byPriceDesc));
  } catch (error) {
    console.error("[ServerDataAccess] Error fetching prioritized products:", error);
    return [];
  }
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export const DEFAULT_ITEMS_PER_PAGE = 12;

function paginate<T>(items: T[], page: number, itemsPerPage: number): PaginatedResult<T> {
  const totalCount = items.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const validPage = Math.max(1, Math.min(page, totalPages || 1));
  const offset = (validPage - 1) * itemsPerPage;
  return {
    data: items.slice(offset, offset + itemsPerPage),
    totalCount,
    totalPages,
    currentPage: validPage,
    itemsPerPage,
  };
}

export async function getAllProductsPaginatedFromDB(
  page: number = 1,
  itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE
): Promise<PaginatedResult<Product>> {
  const all = await getAllProductsPrioritizedFromDB();
  return paginate(all, page, itemsPerPage);
}

export async function getProductsByCategoryPaginatedFromDB(
  category: string,
  page: number = 1,
  itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE
): Promise<PaginatedResult<Product>> {
  const items = await getProductsByCategoryFromDB(category);
  return paginate(items, page, itemsPerPage);
}

export async function getFeaturedProductsPaginatedFromDB(
  page: number = 1,
  itemsPerPage: number = DEFAULT_ITEMS_PER_PAGE
): Promise<PaginatedResult<Product>> {
  const featured = await getFeaturedProductsFromDB(100000);
  return paginate(featured, page, itemsPerPage);
}

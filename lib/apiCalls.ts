import { Product, Category } from "@/types";

// Automatically detect the correct API URL based on environment
const getApiUrl = () => {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // In browser, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // On Vercel, use VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Default to localhost for development
  return 'http://localhost:3000';
};

const API_URL = getApiUrl();

export const getProduct = async (productId: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/api/product/${productId}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Product not found');
    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    console.log('[getAllProducts] API_URL:', API_URL);

    const response = await fetch(`${API_URL}/api/product`, {
      cache: 'no-store'
    });

    console.log('[getAllProducts] Response status:', response.status);

    if (!response.ok) {
      console.error('[getAllProducts] Response not OK:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[getAllProducts] Fetched products count:', Array.isArray(data) ? data.length : 'not an array');

    if (!Array.isArray(data)) {
      console.error('[getAllProducts] API did not return an array:', data);
      return [];
    }

    return data;
  } catch (error) {
    console.error('[getAllProducts] Error fetching all products:', error);
    return [];
  }
};

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/api/product?category=${encodeURIComponent(category)}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Products not found');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getProductsByTopLevelCategory = async (topLevelCategory: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/api/product?topLevelCategory=${encodeURIComponent(topLevelCategory)}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Products not found');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products by top-level category:', error);
    return [];
  }
};

// Get top products by rating and review count
export const getFeaturedProducts = async (limit: number = 20): Promise<Product[]> => {
  try {
    const products = await getAllProducts();
    // Sort by rating (desc) and review count (desc), then take top N
    return products
      .sort((a, b) => {
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        if (ratingB !== ratingA) {
          return ratingB - ratingA;
        }
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/api/categories`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Categories not found');
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Get categories by top-level category
export const getCategoriesByTopLevel = async (topLevelCategory: string): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/api/categories?topLevelCategory=${encodeURIComponent(topLevelCategory)}`, {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Categories not found');
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Error fetching categories by top-level:', error);
    return [];
  }
};

// Get unique top-level categories from all products
export const getTopLevelCategories = async (): Promise<string[]> => {
  try {
    const products = await getAllProducts();
    const topLevels = Array.from(new Set(products.map(p => p.topLevelCategory)));
    return topLevels.sort();
  } catch (error) {
    console.error('Error fetching top-level categories:', error);
    return [];
  }
};

// Get unique categories from all products
export const getProductCategories = async (): Promise<string[]> => {
  try {
    const products = await getAllProducts();
    const categories = Array.from(new Set(products.map(p => p.category)));
    return categories.sort();
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }
};

// Get products by category
export const getCategoryProducts = async (category: string): Promise<Product[]> => {
  try {
    return await getProductsByCategory(category);
  } catch (error) {
    console.error('Error fetching category products:', error);
    return [];
  }
};

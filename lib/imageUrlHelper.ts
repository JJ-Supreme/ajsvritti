/**
 * Sanitizes and enriches product image URLs
 * Handles malformed concatenated URLs and converts imageIds to imageURLs
 */

/**
 * Sanitizes a single image URL/ID
 * - Detects and fixes malformed concatenated URLs
 * - Converts legacy IDs to API endpoints
 * - Returns clean, usable URLs
 */
export function sanitizeImageUrl(id: string): string {
  if (!id) return '';

  // Handle malformed URLs (concatenated URLs like "https://...https://...")
  // Look for a second occurrence of protocol
  const httpsIndex = id.indexOf('https://', 1);
  const httpIndex = id.indexOf('http://', 1);

  // If we find a second protocol, extract from there
  if (httpsIndex > 0) {
    return id.substring(httpsIndex);
  }
  if (httpIndex > 0) {
    return id.substring(httpIndex);
  }

  // If it's already a proper full URL, use as-is
  if (id.startsWith('http://') || id.startsWith('https://')) {
    return id;
  }

  // Legacy ID - convert to API endpoint
  return `/api/images/${id}`;
}

/**
 * Enriches a product with imageURLs array
 * Converts imageIds to sanitized imageURLs
 */
export function enrichProductWithImageURLs<T extends { imageIds?: string[] }>(
  product: T
): T & { imageURLs: string[] } {
  const enriched = { ...product } as T & { imageURLs: string[] };

  if (product.imageIds && Array.isArray(product.imageIds)) {
    enriched.imageURLs = product.imageIds.map(sanitizeImageUrl);
  } else {
    enriched.imageURLs = [];
  }

  return enriched;
}

/**
 * Enriches multiple products with imageURLs
 */
export function enrichProductsWithImageURLs<T extends { imageIds?: string[] }>(
  products: T[]
): (T & { imageURLs: string[] })[] {
  return products.map(enrichProductWithImageURLs);
}

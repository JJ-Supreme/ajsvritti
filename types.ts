// Category interface matching MongoDB structure
export interface Category {
  id: string;
  categoryId: number;
  name: string;
  parentCategory: string;
  serialNumber: string;
  subcategories?: any;
  topLevelCategory: string;
  url: string;
}

// Product interface matching MongoDB structure (imported Meesho data)
export interface Product {
  id: string;
  productId: string;
  title: string;
  category: string;
  categoryId: number;
  image: string;
  link: string;
  parentCategory: string;
  price: number;
  rating: string;
  reviewCount: number;
  scrapedAt: string;
  topLevelCategory: string;
  hasDetails?: boolean; // True if product has detailed information in productDetails collection
  productSizes?: { id: string; name: string; sizeId: string }[];
  selectedColor?: string;
  size?: string;
}

export interface Image {
  id: string;
  url: string;
}

// Request data for creating/updating products
export interface RequestData {
  productId: string;
  title: string;
  category: string;
  categoryId: number;
  parentCategory?: string;
  topLevelCategory?: string;
  price: number;
  rating?: string;
  reviewCount?: number;
  image?: string;
  link?: string;
}

// ProductDetails interfaces for detailed product information
export interface ProductReview {
  review_id: number;
  created: string;
  created_iso: string;
  rating: number;
  helpful_count: number;
  comments: string;
  reviewer_name: string;
  images?: { id: number; url: string }[];
  media?: { id: number; url: string; type: string }[];
}

export interface ProductAttribute {
  field_name: string;
  display_name: string;
  value: string;
}

export interface ProductDetailsData {
  name?: string;
  description?: string;
  images?: string[];
  variations?: string[];
  in_stock?: boolean;
  supplier_name?: string;
  review_summary?: {
    data?: {
      average_rating: number;
      rating_count: number;
      review_count: number;
      rating_count_map?: Record<string, number>;
      reviews?: ProductReview[];
    };
  };
  shipping?: {
    charges: number;
    show_free_delivery: boolean;
    estimated_delivery?: {
      title: string;
      date: string;
    };
  };
  product_details?: {
    product_highlights?: {
      title: string;
      attributes: ProductAttribute[];
    };
    additional_details?: {
      title: string;
      attributes: ProductAttribute[];
    };
  };
  suppliers?: {
    name: string;
    average_rating: number;
    rating_count: number;
    cod_available: boolean;
    price: number;
    original_price: number;
    discount: number;
    value_props?: {
      name: string;
      image: string;
    }[];
  }[];
  mrp_details?: {
    mrp: number;
    title: string;
  };
  breadcrumb?: {
    title: string;
    url: string;
  }[];
}

export interface ProductDetails {
  id: string;
  productId: string;
  catalogId?: string;
  category?: string;
  categoryId?: number;
  data?: ProductDetailsData;
  image?: string;
  link?: string;
  parentCategory?: string;
  price?: number;
  rating?: string;
  reviewCount?: number;
  scrapedAt?: string;
  title?: string;
  topLevelCategory?: string;
}

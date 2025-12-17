export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  sku?: string;
  availabilityStatus?: string;
  shippingInformation?: string;
  reviews: Review[];
}

export interface Review {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Filters {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  rating: number;
  sortBy: 'price' | 'rating' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface FetchParams {
  q?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price' | 'rating' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  skip?: number;
}

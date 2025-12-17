/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product } from '../types/types';

export const maxLimit = 50000;
export const productNo = 20;

export const categoryMenu = [
  "beauty", "fragrances", "furniture", "groceries", "home-decoration",
  "kitchen-accessories", "laptops", "mens-shirts", "mens-shoes",
  "mens-watches", "mobile-accessories", "motorcycle", "skin-care",
  "smartphones", "sports-accessories", "sunglasses", "tablets",
  "tops", "vehicle", "womens-bags", "womens-dresses",
  "womens-jewellery", "womens-shoes", "womens-watches"
];

export const pricePresets = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$100 - $1k', min: 100, max: 1000 },
  { label: '$1k - $10k', min: 1000, max: 10000 },
  { label: '$10k - $50k', min: 10000, max: 50000 },
];

export const formatCategoryName = (slug: string) =>
  slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');

export const filterAndSortProducts = (items: Product[], filters: any) => {
  const filtered = items.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPrice = p.price >= filters.minPrice && p.price <= filters.maxPrice;
    const matchesRating = p.rating >= filters.minRating;
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(p.category);
    return matchesSearch && matchesPrice && matchesRating && matchesCategory;
  });

  if (filters.sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters.sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filters.sortBy === 'alpha') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (filters.sortBy === 'rating-desc') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (filters.sortBy === 'rating-asc') {
    filtered.sort((a, b) => a.rating - b.rating);
  }

  return filtered;
};
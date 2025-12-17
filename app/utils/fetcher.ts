import { Product } from '../types/types';

const API_BASE_URL = 'https://dummyjson.com/products';

export interface FetchParams {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price' | 'rating' | 'title';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    skip?: number;
    signal?: AbortSignal;
    revalidate?: number;
}

export async function fetchProducts(params: FetchParams): Promise<{ products: Product[]; total: number }> {

    const url = new URL(API_BASE_URL);

    const primaryCategory = params.categories?.[0];

    if (primaryCategory) {
        url.pathname = `/products/category/${primaryCategory}`;
    }

    url.searchParams.set('limit', String(params.limit || 20));
    url.searchParams.set('skip', String(params.skip || 0));

    const response = await fetch(url.toString(), {
        next: params.revalidate
            ? { revalidate: params.revalidate }
            : undefined,
        signal: params.signal,
    });

    if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);

    const data = await response.json();
    let products: Product[] = data.products;

    if (params.minPrice !== undefined && params.maxPrice !== undefined) {
        products = products.filter(p => p.price >= params.minPrice! && p.price <= params.maxPrice!);
    }

    if (params.minRating) {
        products = products.filter(p => p.rating >= params.minRating!);
    }

    if (params.sortBy) {
        products.sort((a, b) => {
            let valA: number | string = 0;
            let valB: number | string = 0;

            if (params.sortBy === 'price') {
                valA = a.price;
                valB = b.price;
            } else if (params.sortBy === 'rating') {
                valA = a.rating;
                valB = b.rating;
            } else {
                valA = a.title.toLowerCase();
                valB = b.title.toLowerCase();
            }

            if (valA < valB) return params.sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return params.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    return { products, total: data.total };
}
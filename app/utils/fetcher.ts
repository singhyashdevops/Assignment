import { Product } from '../types/types';

const API_BASE_URL = 'https://dummyjson.com/products';

export interface FetchParams {
    categories?: string[];
    limit?: number;
    skip?: number;
    signal?: AbortSignal;
    revalidate?: number;
}

export async function fetchProducts(params: FetchParams): Promise<{ products: Product[]; total: number }> {

    let finalUrl = API_BASE_URL;

    const primaryCategory = params.categories?.[0];
    if (primaryCategory) {
        finalUrl = `${API_BASE_URL}/category/${primaryCategory}`;
    }

    const url = new URL(finalUrl);
    url.searchParams.set('limit', String(params.limit || 20));
    url.searchParams.set('skip', String(params.skip || 0));

    const response = await fetch(url.toString(), {
        ...(params.revalidate && { next: { revalidate: params.revalidate } }),
        signal: params.signal,
    });

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

    const data = await response.json();

    return { 
        products: data.products, 
        total: data.total 
    };
}
import HomeClient from './HomeClient';
import { fetchProducts } from './utils/fetcher';
import { FetchParams } from './types/types';
import { Metadata } from 'next';

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    categories?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;

  const rawCat = resolvedParams.categories?.split(',')[0];
  const categoryDisplay = rawCat 
    ? rawCat.charAt(0).toUpperCase() + rawCat.slice(1).replace(/-/g, ' ') 
    : 'QuickCart';

  const minP = resolvedParams.minPrice;
  const maxP = resolvedParams.maxPrice;
  
  let priceTag = "";
  if (minP && maxP) {
    priceTag = `$${minP} - $${maxP}`;
  } else {
    priceTag = "Starting $0.99";
  }

  const title = `View ${categoryDisplay} Products | ${priceTag} | QuickCart`;
  const description = `Looking for top-quality ${categoryDisplay.toLowerCase()}? QuickCart offers the best selection ${priceTag === "Starting $0.99" ? 'at unbeatable prices' : `at ${priceTag}`}. 100% satisfaction guaranteed.`;

  return { title, description };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;

  const params: FetchParams = {
    q: resolvedParams.q || undefined,
    categories: resolvedParams.categories?.split(',') || [],
    minPrice: Number(resolvedParams.minPrice) || 0,
    maxPrice: Number(resolvedParams.maxPrice) || 50000,
    minRating: Number(resolvedParams.minRating) || 0,
    sortBy: (resolvedParams.sortBy as 'price' | 'rating' | 'title') || 'price',
    sortOrder: (resolvedParams.sortOrder as 'asc' | 'desc') || 'asc',
    limit: 10,
    skip: 0,
  };

  const { products: initialProducts } = await fetchProducts(params);

  return <HomeClient preloadedProducts={initialProducts} />;
}